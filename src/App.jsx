import "./App.css";
import { useLayoutEffect } from "react";
import Filter from "./components/Filter";
import Navbar from "./components/Navbar.jsx";
import Notifier from "./components/RefreshPopInfos.jsx";

function App() {
  var formData;

  function destroyOl() {
    const div = document.getElementById("contains-ol");
    const olElement = document.getElementById("ol-body");
    if (olElement) {
      div.removeChild(olElement);
    }
  }

  function prettyPrint(element) {
    let jsonString = element.querySelector(".json-viewer").innerHTML.trim();
    try {
      let jsonData = JSON.parse(jsonString);
      var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/gm;
      var replacer = function (match, pIndent, pKey, pVal, pEnd) {
        var key = '<span class="json-key" style="color: #e10000">',
          val = '<span class="json-value" style="color: #001dff">',
          str = '<span class="json-string" style="color: black">',
          r = pIndent || "";
        if (pKey) r = r + key + pKey.replace(/[": ]/g, "") + "</span>: ";
        if (pVal) r = r + (pVal[0] == '"' ? str : val) + pVal + "</span>";
        return r + (pEnd || "");
      };

      element.querySelector(".json-viewer").innerHTML = JSON.stringify(
        jsonData,
        null,
        3
      )
        .replace(/&/g, "&amp;")
        .replace(/\\"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(jsonLine, replacer);
    } catch (e) {}
  }

  function startContent() {
    if (createOl()) {
      loadContent();
    }
  }

  async function corrigeTask(id) {
    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/api/processados",
        {
          params: { id: id },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  useLayoutEffect(() => {
    startContent();

    document
      .getElementById("submit-button-filter")
      .addEventListener("click", async function (event) {
        event.preventDefault();
        formData = new FormData(document.getElementById("filter-form"));
        const loBody = document.getElementById("lo-body");
        destroyOl();
        if (createOl()) {
          loadContent();
        }
      });
  }, []);

  async function createOl() {
    return new Promise(async (resolve, reject) => {
      const existingOl = document.getElementById("ol-body");
      if (!existingOl) {
        const div = document.getElementById("contains-ol");
        const olElement = document.createElement("ol");
        olElement.className = "list-group accordion";
        olElement.id = "ol-body";
        div.appendChild(olElement);
        createOlHeader();
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
  function createOlHeader() {
    const liElement = document.createElement("li");
    liElement.className =
      "list-group-item accordion-item bg-light justify-content-center align-items-center";
    liElement.id = "li-header";

    const divHeader = document.createElement("div");
    divHeader.className =
      "d-flex justify-content-between accordion-header text-body-secondary";

    const spanStatus = document.createElement("span");
    spanStatus.className = "fw-bold col-8 row-item";
    spanStatus.textContent = "Status";

    const spanProcedimento = document.createElement("span");
    spanProcedimento.className = "fw-bold col row-item";
    spanProcedimento.textContent = "Procedimento";

    const spanDuracao = document.createElement("span");
    spanDuracao.className = "fw-bold col row-item";
    spanDuracao.textContent = "Duração";

    const spanData = document.createElement("span");
    spanData.className = "fw-bold col-8 row-item";
    spanData.textContent = "Data";

    const corrigido = document.createElement("span");
    corrigido.className = "fw-bold col-1 row-item";
    corrigido.textContent = "Corrigido";

    const emptySpace = document.createElement("span");
    emptySpace.className = "fw-bold col-1 row-item";
    emptySpace.textContent = "";

    divHeader.appendChild(emptySpace);
    divHeader.appendChild(spanStatus);
    divHeader.appendChild(spanProcedimento);
    divHeader.appendChild(spanDuracao);
    divHeader.appendChild(spanData);
    divHeader.appendChild(corrigido);
    liElement.appendChild(divHeader);
    document.getElementById("ol-body").appendChild(liElement);
  }

  function createCheckBox(status, id) {
    let inputElement = document.createElement("input");
    inputElement.className = "form-check-input";
    inputElement.id = "input" + id;
    inputElement.type = "checkbox";

    if (status === "SUCCESS") {
      inputElement.setAttribute("checked", "");
    }
    if (status === "SUCCESS" || status === "RUNNING") {
      inputElement.classList.add("lockClick"); // Corrected line
    }

    return `<div class="form-check col-1 row-item">
            ${inputElement.outerHTML}
        </div>`;
  }

  function copyText(el) {
    var preElement = el.currentTarget.parentElement.querySelector("pre");
    var textContent = preElement.innerText;
    var textbox = document.createElement("input");
    textbox.type = "text";
    textbox.value = textContent;
    textbox.select();
    navigator.clipboard
      .writeText(textbox.value)
      .then(function () {
        console.log("Texto copiado para a área de transferência!");
      })
      .catch(function (err) {
        console.error("Erro ao copiar texto:", err);
      });
  }

  function createLi(id, body, status, procedure, started_at, finished_at) {
    const new_id = `${id}`;
    const li = document.createElement("li");
    li.setAttribute("id", new_id);
    li.setAttribute("class", "li-body");
    li.classList.add(
      "list-group-item",
      "bg-dark",
      "text-white",
      "container",
      "d-flex",
      "flex-column",
      "justify-content-center"
    );

    li.onclick = function () {
      prettyPrint(this);
    };

    li.setAttribute("aria-expanded", "false");
    let statusIcon;
    if (status === "SUCCESS") {
      statusIcon = `<i class="justify-self-start status-circle fa-solid fa-circle-check col-8 row-item" style="color:#32CD32;"></i>`;
    } else if (status === "WARN") {
      statusIcon = `<i class="status-circle fa-solid fa-circle-exclamation col-8 row-item" style="color:#FFA500;"></i>`;
    } else if (status === "RUNNING") {
      statusIcon = `<i class="status-circle fa-solid fa-circle-pause col-8 row-item" style="color:#007FFF;"></i>`;
    } else if (status === "FATAL") {
      statusIcon = `<i class="status-circle fa-solid fa-circle-xmark col-8 row-item" style="color:#DC143C;"></i>`;
    }

    let duration = calcDuration(started_at, finished_at);
    if (typeof duration === "object") {
      duration = `${duration.days}d, ${duration.hours}h, ${duration.minutes}m ${duration.seconds}s.`;
    }

    li.innerHTML = `
      <div class="d-flex div-li justify-content-between">
      <button class="expand-button col-1" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${id}" aria-controls="collapse${id}">
      <i class="fa-solid fa-chevron-down"></i>
      </button>
          ${statusIcon}
          <span class="col row-item">${procedure}</span>
          <span class="col row-item">${duration}</span>
          <div class="col-8 row-item">
              <span class="date-range badge text-bg-primary fw-bold">${parseDate(
                started_at
              )}</span>
          </div>
    ${createCheckBox(status, id)} 

      </div>
      <div id="collapse${id}" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
          <div class="accordion-body" id="copy-div">
              <i class="fa-solid fa-copy"></i>
              <pre class="json-viewer">${body}</pre>
          </div>
      </div>
  `;
    return li;
  }

  async function loadContent(index = null) {
    await getLogs(index).then(() => {
      const content = document.querySelector(".li-body:last-child");
      if (Array(content)[0]) {
        lastCardObserver.observe(content);
      }
    });
  }

  function calcDuration(started_at, finished_at) {
    if (finished_at) {
      let startDate = new Date(started_at);
      let endDate = new Date(finished_at);
      let diffInMilliseconds = Math.abs(endDate - startDate);
      let diffInSeconds = Math.floor(diffInMilliseconds / 1000);
      let days = Math.floor(diffInSeconds / (60 * 60 * 24));
      let hours = Math.floor((diffInSeconds % (60 * 60 * 24)) / (60 * 60));
      let minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
      let seconds = Math.floor(diffInSeconds % 60);

      return { days, hours, minutes, seconds };
    }
    return "Em progresso";
  }

  function parseDate(dateString) {
    const dateObject = new Date(dateString);
    const formattedDatePart = dateObject.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTimePart = dateObject.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `${formattedDatePart} ${formattedTimePart}`;
  }

  async function getLogs(lastIndex) {
    await axios
      .post("http://127.0.0.1:8000/api/processados", formData, {
        params: { lastIndex: lastIndex },
      })
      .then(function (response) {
        const data = response.data;
        const olBody = document.getElementById("ol-body");
        data.forEach((el) => {
          const listItem = createLi(
            el.id,
            el.body,
            el.status,
            el.procedure,
            el.started_at,
            el.finished_at
          );
          observer.observe(listItem);
          olBody.appendChild(listItem);
          let input = document.getElementById("input" + el.id);

          if (input) {
            input.addEventListener("click", function () {
              input.setAttribute("checked", "");
              input = document.getElementById("input" + el.id);
              if (input.hasAttribute("checked")) {
                input.classList.add("lockClick");
                
                corrigeTask(el.id);
              }
            });
          }

          const i = document.getElementById(el.id).querySelector(".fa-copy");
          i.addEventListener("click", function (el) {
            copyText(el);
          });
        });
        return true;
      })
      .catch(function (error) {
        console.error("Erro ao fazer a requisição:", error);
        return false;
      });
  }

  const lastCardObserver = new IntersectionObserver((entries) => {
    const lastCard = entries[0];
    if (!lastCard.isIntersecting) return;
    loadContent(lastCard.target.id);
    lastCardObserver.unobserve(lastCard.target);
  }, {});

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("show", entry.isIntersecting);
    });
  });

  return (
    <>
      <Navbar />
      <Filter />
      <Notifier />
      <br></br>
      <div className="container" id="contains-ol"></div>
    </>
  );
}

export default App;
