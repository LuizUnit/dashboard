import React, { useState, useEffect } from "react";

export function PopNotifier({ fatal, warn }) {
  return (
    <div className="container d-flex align-items-center justify-content-end">
      <button
        type="button"
        className="btn btn-danger position-relative"
        aria-label="Fatal Errors"
      >
        Fatals
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          {fatal}
          <span className="visually-hidden">fatal errors</span>
        </span>
      </button>
      <button
        type="button"
        className="btn btn-warning position-relative ms-4"
        aria-label="Warnings"
      >
        Warns
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning">
          {warn}
          <span className="visually-hidden">warnings</span>
        </span>
      </button>
    </div>
  );
}

export default function Notifier() {
  const [errorCount, setErrorCount] = useState(0);
  const [warnCount, setWarnCount] = useState(0);
  const [fatalCount, setFatalCount] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const newErrorCount = await UpdateInfos();
      const newFatalCount = await getFatals();
      const newWarnCount = await getWarns();
      setErrorCount(newErrorCount);
      setWarnCount(newFatalCount);
      setFatalCount(newWarnCount);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <PopNotifier fatal={fatalCount} warn={warnCount} />
    </div>
  );
}

async function UpdateInfos() {
  try {
    const count = await getErrors();
    if (count > 0) {
      document.title = `${count} New Errors!`;
      return count;
    }
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error);
  }
  return 0;
}

async function getErrors() {
  try {
    const response = await axios.get(
      "http://127.0.0.1:8000/api/processados/erros"
    );
    return response.data[0]?.count || 0;
  } catch (error) {
    console.error("Erro ao requisitar erros:", error);
    return 0;
  }
}

async function getWarns() {
  try {
    const response = await axios.get(
      "http://127.0.0.1:8000/api/processados/warn"
    );
    return response.data[0]?.count || 0;
  } catch (error) {
    console.error("Erro ao requisitar warns:", error);
    return 0;
  }
}

async function getFatals() {
  try {
    const response = await axios.get(
      "http://127.0.0.1:8000/api/processados/fatal"
    );
    return response.data[0]?.count || 0;
  } catch (error) {
    console.error("Erro ao requisitar fatals:", error);
    return 0;
  }
}
