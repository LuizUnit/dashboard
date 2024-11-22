import {useState, useEffect} from "react";

export default function Filter() {
  const [procedures, setProcedures] = useState(null);
  const [warnChecked, setwarnChecked] = useState(true);
  const [successChecked, setSuccessChecked] = useState(true);
  const [runningChecked, setRunningChecked] = useState(true);
  const [fatalChecked, setFatalChecked] = useState(true);

  async function getProcedures() {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/procedures");
      setProcedures(response.data);
    } catch (error) {
      console.error("Erro ao fazer a requisição:", error);
      setProcedures([]); // Atualiza o estado com um array vazio
    }
  }

  const handleCheckboxChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    switch (target.name) {
      case "check-box-warn":
        setwarnChecked(value);
        break;
      case "check-box-success":
        setSuccessChecked(value);
        break;
      case "check-box-running":
        setRunningChecked(value);
        break;
      case "check-box-failure":
        setFatalChecked(value);
        break;
    }
  };

  useEffect(() => {
    $(function () {
      $('input[name="datetimes"]').daterangepicker({
        opens: "left",
        timePicker: true,
        locale: {
          format: "DD/MM/YYYY HH:mm",
        },
      });
    });
    getProcedures(); // Chamada corrigida
  }, []);

  return (
    <form id="filter-form" className="col">
      <div>
          {procedures &&
            procedures.map((procedure, index) => (
              <div key={index} className="form-check text-white">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name={procedure.procedure} // Array para enviar múltiplos valores
                  value={procedure.procedure} // Valor dinâmico do procedimento
                  id={`flexCheckChecked${index}`} // ID único para cada checkbox
                  onChange={handleCheckboxChange}
                />

                <label
                  className="form-check-label"
                  htmlFor={`flexCheckChecked${index}`}>
                  {" "}
                  {/* ID único aqui também */}
                  {procedure.procedure} {/* Nome do procedimento exibido */}
                </label>
              </div>
            ))}

        <input
          name="content"
          className="form-control mb-3 mt-4"
          placeholder="Pesquisa por conteúdo."></input>

        <div className="date" data-provide="datepicker">
          <input
            type="text"
            name="datetimes"
            className="form-control mb-4"
            placeholder="Selecione uma data"
          />
          <div className="input-group-addon">
            <span className="glyphicon glyphicon-th"></span>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column justify-content-between">
        <div className="form-check text-white">
          <input
            className="form-check-input"
            type="checkbox"
            name="check-box-warn"
            value=""
            id="flexCheckChecked1"
            checked={warnChecked}
            onChange={handleCheckboxChange}></input>

          <label className="form-check-label" htmlFor="flexCheckChecked1">
            Atenção
          </label>
        </div>
        <div className="form-check text-white">
          <input
            className="form-check-input"
            type="checkbox"
            name="check-box-success"
            value=""
            id="flexCheckChecked2"
            checked={successChecked}
            onChange={handleCheckboxChange}></input>
          <label className="form-check-label" htmlFor="flexCheckChecked2">
            Sucesso
          </label>
        </div>
        <div className="form-check text-white">
          <input
            className="form-check-input"
            type="checkbox"
            name="check-box-running"
            value=""
            id="flexCheckChecked3"
            checked={runningChecked}
            onChange={handleCheckboxChange}></input>

          <label className="form-check-label" htmlFor="flexCheckChecked3">
            Em progresso
          </label>
        </div>
        <div className="form-check text-white mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            name="check-box-failure"
            value=""
            id="flexCheckChecked4"
            checked={fatalChecked}
            onChange={handleCheckboxChange}></input>

          <label className="form-check-label" htmlFor="flexCheckChecked4">
            Erro Fatal
          </label>
        </div>
      </div>
      <button
        id="submit-button-filter"
        tyrette="button"
        className="btn btn-primary mt-3">
        Enviar
      </button>
    </form>
  );
}
