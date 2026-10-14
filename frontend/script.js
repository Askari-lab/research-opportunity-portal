// Update this URL if your Flask API runs on a different host or port.
const API = "http://127.0.0.1:5000/api/opportunities";
const form = document.querySelector("#opportunityForm");
const list = document.querySelector("#opportunityList");
const details = document.querySelector("#details");
const message = document.querySelector("#message");
const cancelEdit = document.querySelector("#cancelEdit");
let editingId = null;

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}
async function api(url, options = {}) {
  const response = await fetch(url, options);
  let data = {};
  try { data = await response.json(); } catch (_) {}
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
function addText(parent, tag, text, className = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  parent.appendChild(node);
  return node;
}
async function loadOpportunities() {
  list.replaceChildren();
  try {
    const records = await api(API);
    if (!records.length) {
      addText(list, "p", "No opportunities have been posted yet.", "muted");
      return;
    }
    records.forEach(item => {
      const card = document.createElement("article");
      card.className = "opportunity-card";
      addText(card, "span", item.status, `status ${item.status === "Closed" ? "closed" : ""}`);
      addText(card, "h3", item.title);
      addText(card, "p", `${item.research_area} · ${item.department}`);
      addText(card, "p", `Faculty: ${item.faculty_name}`);
      addText(card, "p", `Positions: ${item.available_positions}`);
      addText(card, "p", `Deadline: ${item.application_deadline}`);
      const actions = document.createElement("div");
      actions.className = "card-actions";
      const view = addText(actions, "button", "View details");
      view.onclick = () => viewOpportunity(item.id);
      const edit = addText(actions, "button", "Edit");
      edit.className = "secondary";
      edit.onclick = () => editOpportunity(item.id);
      const close = addText(actions, "button", item.status === "Closed" ? "Closed" : "Close");
      close.className = "secondary";
      close.disabled = item.status === "Closed";
      close.onclick = () => closeOpportunity(item.id);
      const del = addText(actions, "button", "Delete");
      del.className = "danger";
      del.onclick = () => deleteOpportunity(item.id);
      card.appendChild(actions);
      list.appendChild(card);
    });
  } catch (error) {
    addText(list, "p", error.message, "muted");
    showMessage("Could not load records. Is the backend running?", true);
  }
}
async function viewOpportunity(id) {
  try {
    const item = await api(`${API}/${id}`);
    details.replaceChildren();
    Object.entries(item).forEach(([key, value]) => addText(details, "p", `${key.replaceAll("_", " ")}: ${value ?? ""}`));
    showMessage("Opportunity details loaded.");
  } catch (error) { showMessage(error.message, true); }
}
async function editOpportunity(id) {
  try {
    const item = await api(`${API}/${id}`);
    for (const field of form.elements) {
      if (field.name && Object.hasOwn(item, field.name)) field.value = item[field.name];
    }
    editingId = id;
    document.querySelector("#formTitle").textContent = "Update opportunity";
    document.querySelector("#saveButton").textContent = "Save changes";
    cancelEdit.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) { showMessage(error.message, true); }
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  data.available_positions = Number(data.available_positions);
  if (!Number.isInteger(data.available_positions) || data.available_positions < 1) {
    showMessage("Available positions must be a positive whole number.", true);
    return;
  }
  try {
    const result = await api(editingId ? `${API}/${editingId}` : API, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    showMessage(result.message);
    resetForm();
    await loadOpportunities();
  } catch (error) { showMessage(error.message, true); }
});
async function closeOpportunity(id) {
  try {
    const item = await api(`${API}/${id}`);
    item.status = "Closed";
    const result = await api(`${API}/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    showMessage(result.message);
    await loadOpportunities();
    await viewOpportunity(id);
  } catch (error) { showMessage(error.message, true); }
}
async function deleteOpportunity(id) {
  if (!confirm("Are you sure you want to delete this opportunity?")) return;
  try {
    const result = await api(`${API}/${id}`, { method: "DELETE" });
    showMessage(result.message);
    details.textContent = "Choose “View details” on a record.";
    await loadOpportunities();
  } catch (error) { showMessage(error.message, true); }
}
function resetForm() {
  form.reset();
  editingId = null;
  document.querySelector("#formTitle").textContent = "Create an opportunity";
  document.querySelector("#saveButton").textContent = "Save opportunity";
  cancelEdit.hidden = true;
}
cancelEdit.addEventListener("click", resetForm);
document.querySelector("#refreshButton").addEventListener("click", loadOpportunities);
loadOpportunities();
