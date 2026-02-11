import React from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Container from "../Components/Container/Container.jsx";

function BookEngineerForm() {
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <h2>Book Engineer</h2>
      </form>
    </Container>
  );
}

export default BookEngineerForm;
