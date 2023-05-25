import React from "react";
import Alert from "./Alert";

export default function ErrorHandler({ errors = [] }) {
  return errors.map((row) => (
    <Alert severity={row.severity}>{row.message}</Alert>
  ));
}
