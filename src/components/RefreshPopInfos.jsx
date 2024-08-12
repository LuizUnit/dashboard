import React, {useState, useEffect} from "react";

export function PopNotifier({fatal, warn}) {
  return (
    <div
      className="d-flex align-items-start col pb-3 justify-content-end"
      id="flash-pop-notifies">
      <button
        type="button"
        className="btn btn-danger position-relative"
        aria-label="Fatal Errors">
        Fatals
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          {fatal}
          <span className="visually-hidden">fatal errors</span>
        </span>
      </button>
      <button
        type="button"
        className="btn btn-warning position-relative ms-3"
        aria-label="Warnings">
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
  const [warnCount, setWarnCount] = useState(0);
  const [fatalCount, setFatalCount] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      await UpdateInfos();
      setWarnCount(await getErrors("warn"));
      setFatalCount(await getErrors("fatal"));
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
    const count = await getErrors("erros");
    if (count > 0) {
      document.title = `${count} New Errors!`;
      return count;
    }
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error);
  }
  return 0;
}

async function getErrors(param) {
  try {
    const response = await axios.get(
      "http://127.0.0.1:8000/api/processados/" + param
    );
    return response.data[0]?.count || 0;
  } catch (error) {
    console.error("Erro ao requisitar:", error);
    return 0;
  }
}
