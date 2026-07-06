import { useRef, useState } from 'react';

export default function InlineRename() {
  const [name, setName] = useState('galaxy-brain-dev');
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  function startEditing() {
    setDraft(name);
    setEditing(true);
    inputRef.current.focus();
  }

  function save() {
    setName(draft.trim() || name);
    setEditing(false);
  }

  return (
    <div className="lv-card">
      <h4 className="lv-heading">👤 Display name</h4>
      {editing ? (
        <div className="lv-row">
          <input
            ref={inputRef}
            className="lv-input"
            data-testid="name-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button className="lv-btn primary" data-testid="save-btn" onClick={save}>
            Save
          </button>
        </div>
      ) : (
        <div className="lv-row spread">
          <span data-testid="display-name">{name}</span>
          <button className="lv-btn" data-testid="edit-btn" onClick={startEditing}>
            Edit
          </button>
        </div>
      )}
      <p className="lv-muted">Press Edit — the field should be ready to type in immediately.</p>
    </div>
  );
}
