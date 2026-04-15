import React, { useContext, useEffect, useRef, useState } from "react";
import { client } from "../Api";
import { MessageContext } from "./MessageHandler";
import { useRefreshSurveyDefinitions } from "./SurveyDefinitionsContext";

const SLOT_TYPES = ["likert", "checkbox"];

let keySeq = 0;
function newSlot(index) {
  keySeq += 1;
  return {
    id: `q${index}`,
    type: "likert",
    placeholder: "",
    stableKey: keySeq,
  };
}

function SlotRow({ slot, index, onChange, onRemove, locked, canRemove }) {
  return (
    <div className="tm-slot-row">
      <div className="tm-slot-fields">
        <input
          type="text"
          value={slot.id}
          disabled={locked}
          placeholder="Slot ID (e.g. q0)"
          onChange={(e) => onChange(index, "id", e.target.value)}
          className="tm-slot-id"
          aria-label={`Slot ${index + 1} ID`}
        />
        <select
          value={slot.type}
          disabled={locked}
          onChange={(e) => onChange(index, "type", e.target.value)}
          className="tm-slot-type"
          aria-label={`Slot ${index + 1} type`}
        >
          {SLOT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={slot.placeholder}
          placeholder="Placeholder text shown to survey creators"
          onChange={(e) => onChange(index, "placeholder", e.target.value)}
          className="tm-slot-placeholder"
          aria-label={`Slot ${index + 1} placeholder`}
        />
      </div>
      {!locked && canRemove && (
        <button
          type="button"
          className="tm-slot-remove"
          onClick={() => onRemove(index)}
          title="Remove slot"
          aria-label={`Remove slot ${index + 1}`}
        >
          <span className="material-symbols-outlined">remove_circle</span>
        </button>
      )}
    </div>
  );
}

function submitLabel(isSaving, isEdit) {
  if (isSaving) return "Saving…";
  return isEdit ? "Save changes" : "Create";
}

function TemplateForm({ initialData, onSave, onCancel, isSaving }) {
  const isEdit = initialData !== null;
  const locked = isEdit && initialData.survey_count > 0;

  const [label, setLabel] = useState(isEdit ? initialData.label : "");
  const [slug, setSlug] = useState(isEdit ? initialData.slug : "");
  const [slots, setSlots] = useState(() => {
    if (!isEdit) return [newSlot(0)];
    return initialData.slots.map((s) => {
      keySeq += 1;
      return {
        id: s.id,
        type: s.type,
        placeholder: s.placeholder,
        stableKey: keySeq,
      };
    });
  });

  const handleSlotChange = (index, field, value) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddSlot = () => {
    setSlots((prev) => [...prev, newSlot(prev.length)]);
  };

  const handleRemoveSlot = (index) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ label, slug, slots });
  };

  return (
    <form onSubmit={handleSubmit} className="tm-form">
      <h2>{isEdit ? "Edit Template" : "New Template"}</h2>

      <label className="tm-field" htmlFor="tm-label">
        <span>Label</span>
        <input
          id="tm-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
          placeholder="e.g. 3 Likert + Checkbox"
        />
      </label>

      {!isEdit && (
        <label className="tm-field" htmlFor="tm-slug">
          <span>Slug</span>
          <input
            id="tm-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            placeholder="e.g. L3C (short unique identifier)"
            maxLength={20}
          />
        </label>
      )}

      <div className="tm-slots-section">
        <p className="tm-slots-header">
          Slots
          {locked && (
            <span className="tm-locked-note">
              — IDs and types are locked (surveys already use this template)
            </span>
          )}
        </p>
        <div className="tm-slot-legend">
          <span className="tm-slot-legend-id">ID</span>
          <span className="tm-slot-legend-type">Type</span>
          <span className="tm-slot-legend-placeholder">Placeholder</span>
        </div>
        {slots.map((slot, i) => (
          <SlotRow
            key={slot.stableKey}
            slot={slot}
            index={i}
            onChange={handleSlotChange}
            onRemove={handleRemoveSlot}
            locked={locked}
            canRemove={slots.length > 1}
          />
        ))}
        {!locked && (
          <button type="button" className="tm-add-slot" onClick={handleAddSlot}>
            <span className="material-symbols-outlined">add_circle</span>
            Add slot
          </button>
        )}
      </div>

      <div className="tm-form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="tm-cancel"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button type="submit" className="tm-submit" disabled={isSaving}>
          {submitLabel(isSaving, isEdit)}
        </button>
      </div>
    </form>
  );
}

function deleteTitle(t) {
  if (t.is_builtin) return "Built-in templates cannot be deleted";
  if (t.survey_count > 0) return "Cannot delete: surveys use this template";
  return "Delete template";
}

function TemplateList({ templates, loading, onCreate, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  if (loading) {
    return (
      <div className="tm-loading">
        <div className="loading-bar" />
      </div>
    );
  }

  return (
    <div>
      <div className="tm-list-header">
        <h2>Survey Templates</h2>
        <button type="button" className="tm-create-btn" onClick={onCreate}>
          <span className="material-symbols-outlined">add</span>
          New template
        </button>
      </div>

      {templates.length === 0 ? (
        <p className="tm-empty">No templates found.</p>
      ) : (
        <div className="dashboard--question--table">
          <table>
            <thead>
              <tr>
                <th>Label</th>
                <th>Slug</th>
                <th>Slots</th>
                <th>Surveys</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.slug}>
                  <td>{t.label}</td>
                  <td>
                    <code>{t.slug}</code>
                  </td>
                  <td>{t.slots.length}</td>
                  <td>{t.survey_count}</td>
                  <td>{t.is_builtin ? "Built-in" : "Custom"}</td>
                  <td className="tm-actions">
                    {confirmDelete === t.slug ? (
                      <span className="tm-confirm">
                        Delete?{" "}
                        <button
                          type="button"
                          className="tm-btn tm-btn-danger"
                          onClick={() => {
                            setConfirmDelete(null);
                            onDelete(t);
                          }}
                        >
                          Yes
                        </button>{" "}
                        <button
                          type="button"
                          className="tm-btn"
                          onClick={() => setConfirmDelete(null)}
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="tm-btn"
                          onClick={() => onEdit(t)}
                          disabled={t.is_builtin}
                          title={
                            t.is_builtin
                              ? "Built-in templates cannot be modified"
                              : "Edit template"
                          }
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="tm-btn tm-btn-danger"
                          onClick={() => setConfirmDelete(t.slug)}
                          disabled={t.is_builtin || t.survey_count > 0}
                          title={deleteTitle(t)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function TemplateManager({ onClose }) {
  const [view, setView] = useState("list");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { pushError } = useContext(MessageContext);
  const refreshDefinitions = useRefreshSurveyDefinitions();
  const panelRef = useRef(null);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    setLoading(true);
    client
      .get("/api/survey/templates/")
      .then(({ data }) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch((err) => {
        pushError(err);
        setLoading(false);
      });
  }, [reloadKey]); // pushError is stable from context; reloadKey drives re-fetches

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleCreate = async ({ label, slug, slots }) => {
    setSaving(true);
    try {
      await client.post("/api/survey/templates/", { label, slug, slots });
      refreshDefinitions();
      reload();
      setView("list");
    } catch (err) {
      pushError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async ({ label, slots }) => {
    setSaving(true);
    try {
      await client.patch(`/api/survey/templates/${editTarget.slug}/`, {
        label,
        slots,
      });
      refreshDefinitions();
      reload();
      setView("list");
    } catch (err) {
      pushError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (template) => {
    try {
      await client.delete(`/api/survey/templates/${template.slug}/`);
      refreshDefinitions();
      reload();
    } catch (err) {
      pushError(err);
    }
  };

  return (
    <div className="overlay">
      <div className="template-manager" ref={panelRef}>
        <button
          type="button"
          className="tm-close"
          onClick={onClose}
          aria-label="Close template manager"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {view === "list" && (
          <TemplateList
            templates={templates}
            loading={loading}
            onCreate={() => setView("create")}
            onEdit={(t) => {
              setEditTarget(t);
              setView("edit");
            }}
            onDelete={handleDelete}
          />
        )}

        {view === "create" && (
          <TemplateForm
            initialData={null}
            onSave={handleCreate}
            onCancel={() => setView("list")}
            isSaving={saving}
          />
        )}

        {view === "edit" && editTarget && (
          <TemplateForm
            initialData={editTarget}
            onSave={handleEdit}
            onCancel={() => setView("list")}
            isSaving={saving}
          />
        )}
      </div>
    </div>
  );
}
