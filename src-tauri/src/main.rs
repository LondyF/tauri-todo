// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::serde::ts_seconds_option;
use chrono::{DateTime, Utc};
use serde::{ser::Serializer, Deserialize, Serialize};
use std::sync::Mutex;
use std::vec;
use tauri::State;
use uuid::Uuid;

struct AppState {
    todos: Mutex<Vec<Todo>>,
}

#[derive(Serialize, Deserialize, Clone)]
struct Todo {
    id: Uuid,
    title: String,
    completed: bool,
    #[serde(with = "ts_seconds_option")]
    last_updated: Option<DateTime<Utc>>,
}

#[tauri::command]
fn get_todos(state: tauri::State<AppState>) -> Vec<Todo> {
    state.todos.lock().unwrap().clone()
}

#[tauri::command]
fn add_todo(state: tauri::State<AppState>, title: String) -> Vec<Todo> {
    let mut todos = state.todos.lock().unwrap();

    todos.push(Todo {
        id: Uuid::new_v4(),
        title,
        completed: false,
        last_updated: Some(Utc::now()),
    });

    todos.clone()
}

#[tauri::command]
fn remove_todo(state: tauri::State<AppState>, id: Uuid) -> Vec<Todo> {
    let mut todos = state.todos.lock().unwrap();

    let index = todos.iter().position(|todo| todo.id == id).unwrap();
    todos.remove(index);

    todos.clone()
}

#[tauri::command]
fn toggle_complete(state: tauri::State<AppState>, id: Uuid) -> Vec<Todo> {
    let mut todos = state.todos.lock().unwrap();

    let index = todos.iter().position(|todo| todo.id == id).unwrap();
    todos[index].completed = !todos[index].completed;
    todos[index].last_updated = Some(Utc::now());

    todos.clone()
}

fn main() {
    let state = AppState {
        todos: Default::default(),
    };

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            get_todos,
            add_todo,
            remove_todo,
            toggle_complete
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
