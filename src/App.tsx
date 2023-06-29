import React from "react";

import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  last_updated: number;
};

function App() {
  const [todos, setTodos] = React.useState<Todo[]>([]);
  const [newTodo, setNewTodo] = React.useState("");

  const { width, height } = useWindowSize();

  React.useEffect(() => {
    invoke("get_todos").then((todos) => {
      setTodos(todos as Todo[]);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    invoke("add_todo", { title: newTodo }).then((todos) => {
      setTodos(todos as Todo[]);
      setNewTodo("");
    });
  };

  const handleDelete = (id: string) => {
    invoke("remove_todo", { id }).then((todos) => {
      setTodos(todos as Todo[]);
    });
  };

  const handleTodoClick = (id: string) => {
    invoke("toggle_complete", { id }).then((todos) => {
      setTodos(todos as Todo[]);
    });
  };
  const allCompleted =
    todos.every((todo) => todo.completed) && todos.length > 0;

  return (
    <div className="container">
      {allCompleted && <Confetti width={width} height={height} />}
      <h1>My Todos {!allCompleted ? "😭" : "🥳"}</h1>
      <form className="row" onSubmit={handleSubmit}>
        <input
          value={newTodo}
          id="greet-input"
          onChange={(e) => setNewTodo(e.currentTarget.value)}
          placeholder="Enter a todo"
        />
        <button type="submit">Add Todo</button>
      </form>
      {todos.length === 0 && <h3>You have no todo's</h3>}
      <div>
        <ul>
          {[...todos].reverse().map((todo) => (
            <div key={todo.id}>
              <p>
                <span
                  style={{
                    cursor: "pointer",
                    textDecoration: todo.completed ? "line-through" : "none",
                    marginRight: 10,
                  }}
                  onClick={() => handleTodoClick(todo.id)}
                >
                  {todo.title}
                  <span> - </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontStyle: "italic",
                      color: "lightgray",
                    }}
                  >
                    last updated by:{" "}
                    {new Date(todo.last_updated * 1000).toLocaleString()}
                  </span>
                </span>
                <button
                  onClick={() => handleDelete(todo.id)}
                  style={{ borderColor: "darkRed" }}
                >
                  Delete
                </button>
              </p>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
