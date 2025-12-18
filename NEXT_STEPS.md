# Next Steps - Dreadmarch Campaign Manager

This document captures planned improvements discussed on 2025-12-18.

---

## Part 1: Editor Workflow Improvements

### Current Pain Points

The current workflow for making edits permanent is cumbersome:

1. User makes edits → jobs accumulate in memory
2. Click "Build Patched Dataset" → downloads JSON file
3. **Manual steps required:**
   - Open `dm4-dataset-main.js`
   - Replace the entire JSON object
   - Save the file
   - Refresh the page

### Proposed Improvements (Hybrid Approach)

Implement a combination of features for a smoother workflow:

#### 1. "Apply Changes" Button
- Applies all pending jobs immediately to the in-memory dataset
- Changes visible on map right away
- Does NOT download a file
- Jobs queue is cleared after successful apply

#### 2. "Export Dataset" Button
- Downloads the current dataset state as JSON
- Used when ready to save permanently or share
- Separate from applying changes

#### 3. "Import Dataset" Button
- File upload dialog to load a JSON dataset
- Immediately replaces current dataset in viewer
- Works with previously exported files

```javascript
// Implementation sketch
var importBtn = document.createElement("button");
importBtn.textContent = "Import Dataset";
importBtn.addEventListener("click", function() {
  var input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.addEventListener("change", function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function(evt) {
      var newDataset = JSON.parse(evt.target.result);
      window.DM4_DATASETS.main = newDataset;
      state.actions.setDataset(DM4.dataset.normalize(newDataset));
    };
    reader.readAsText(file);
  });
  input.click();
});
```

#### 4. LocalStorage Persistence
- Auto-save dataset to localStorage after applying changes
- On page load, check for saved dataset and restore it
- Survives page refresh

```javascript
// After applying patch
localStorage.setItem("DM4_PATCHED_DATASET", JSON.stringify(patchedDataset));

// On page load
var savedDataset = localStorage.getItem("DM4_PATCHED_DATASET");
if (savedDataset) {
  window.DM4_DATASETS.main = JSON.parse(savedDataset);
}
```

#### 5. "Reset to Default" Button
- Reloads the original bundled dataset from `dm4-dataset-main.js`
- Clears localStorage saved state
- Confirmation dialog to prevent accidents

### Improved Workflow Summary

| Action | Result |
|--------|--------|
| Make edits | Jobs accumulate (as now) |
| **Apply Changes** | Changes visible immediately on map |
| Continue editing | More jobs accumulate |
| **Apply Changes** again | All changes applied |
| **Export Dataset** | Download JSON to save permanently |
| Refresh page | LocalStorage restores your session |
| **Import Dataset** | Load a previously exported JSON |
| **Reset to Default** | Go back to the bundled dataset |

---

## Part 2: Real-Time Collaborative Architecture

### Goal

Enable multiple users to view and edit the same dataset simultaneously, with changes syncing in real-time across all connected browsers.

### Current Architecture (Static)

```
┌─────────────┐     ┌─────────────┐
│   Browser   │     │   Browser   │
│  (User A)   │     │  (User B)   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       ▼                   ▼
┌─────────────────────────────────┐
│     Static Files (GitHub Pages) │
│  • index.html                   │
│  • dm4-dataset-main.js          │
│  • All other JS/CSS             │
└─────────────────────────────────┘

Each user loads their own copy.
Edits are local only.
No synchronization.
```

### Target Architecture (Real-Time Collaborative)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │     │   Browser   │     │   Browser   │
│  (User A)   │     │  (User B)   │     │  (User C)   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │    WebSocket      │    WebSocket      │
       └───────────┬───────┴───────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │   Server        │
         │  • WebSocket    │
         │  • Auth (opt)   │
         │  • Broadcast    │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │   Database      │
         │  • Dataset JSON │
         │  • Edit history │
         │  • User sessions│
         └─────────────────┘
```

### Technology Options

#### Option A: Firebase Realtime Database / Firestore

| Pros | Cons |
|------|------|
| Zero server code needed | Vendor lock-in |
| Built-in real-time sync | NoSQL structure |
| Generous free tier | Cost at scale |
| Authentication included | |
| Scales automatically | |

#### Option B: Supabase (Recommended)

| Pros | Cons |
|------|------|
| Open source | Slightly more setup than Firebase |
| PostgreSQL backend | Less mature ecosystem |
| Real-time subscriptions built-in | |
| Self-hostable | |
| Good free tier | |

#### Option C: Custom WebSocket Server

| Pros | Cons |
|------|------|
| Full control | More code to write |
| No vendor lock-in | Need to handle scaling |
| Any database | Reconnection logic needed |

**Stack:** Node.js + Express + Socket.io + PostgreSQL/MongoDB

#### Option D: Partykit / Cloudflare Durable Objects

| Pros | Cons |
|------|------|
| Edge-deployed, low latency | Newer technology |
| Built for real-time collaboration | Learning curve |
| Serverless | |

### Key Architectural Decisions

#### 1. Conflict Resolution Strategy

| Strategy | Description | Complexity |
|----------|-------------|------------|
| **Last Write Wins** | Simple, but can lose data | Low |
| **Operational Transform** | Complex, used by Google Docs | High |
| **CRDTs** | Conflict-free, used by Figma | High |
| **Locking** | User locks item while editing | Medium |
| **Merge + Notify** | Accept both, notify of conflict | Medium |

**Recommendation:** Start with **Last Write Wins** + **change notifications**.

#### 2. Sync Scope

| Option | Description | Bandwidth |
|--------|-------------|-----------|
| Full dataset on every change | Simple but heavy | ~500KB/update |
| Delta/patch only | Efficient | ~1KB/update |
| Hybrid | Full on connect, deltas after | Optimal |

**Recommendation:** Sync **editor jobs** (deltas), full dataset only on initial load.

#### 3. Authentication & Permissions

| Level | Description |
|-------|-------------|
| None | Anyone can edit (risky) |
| View-only default | Anyone views, editors need auth |
| Full auth | Login required for everything |
| Role-based | Admins, Editors, Viewers |

**Recommendation:** **View-only by default**, simple auth for editors.

#### 4. Presence Features

- Show who else is online (avatars/names)
- Highlight which system each user has selected
- "User B is editing Darkknell" indicators
- Optional: cursor/viewport tracking

### Recommended Stack

| Component | Recommendation | Reason |
|-----------|----------------|--------|
| **Database** | Supabase | Free tier, real-time built-in |
| **Real-time** | Supabase Realtime | No extra server needed |
| **Auth** | Supabase Auth | Simple, optional |
| **Static Hosting** | GitHub Pages / Vercel | Free, already using |
| **Server (if needed)** | Railway / Render | Easy Node.js hosting |

### Migration Path

#### Phase 1: Database Backend
- [ ] Set up Supabase project
- [ ] Create table for dataset (JSON column or normalized)
- [ ] Create table for edit history/audit log
- [ ] Modify viewer to load dataset from Supabase on boot
- [ ] Modify editor to save changes to Supabase

#### Phase 2: Real-Time Sync
- [ ] Subscribe to Supabase Realtime changes
- [ ] When any client saves, all clients update
- [ ] Add toast notifications: "User X updated System Y"
- [ ] Handle reconnection gracefully

#### Phase 3: Presence & Collaboration UI
- [ ] Track online users in Supabase
- [ ] Display online user list in viewer
- [ ] Show which system each user has selected
- [ ] Optional: broadcast cursor positions

#### Phase 4: Auth & Permissions
- [ ] Add Supabase Auth integration
- [ ] Implement view-only mode for anonymous users
- [ ] Editor role requires authentication
- [ ] Admin controls for user management

### Example Supabase Schema

```sql
-- Dataset storage
CREATE TABLE datasets (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Edit history for audit trail
CREATE TABLE edit_history (
  id SERIAL PRIMARY KEY,
  dataset_id TEXT REFERENCES datasets(id),
  user_id UUID,
  job JSONB NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Online presence
CREATE TABLE presence (
  user_id UUID PRIMARY KEY,
  display_name TEXT,
  selected_system TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE datasets;
ALTER PUBLICATION supabase_realtime ADD TABLE presence;
```

### Example Client Integration

```javascript
// Initialize Supabase client
var supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load dataset on boot
async function loadDatasetFromServer() {
  var { data, error } = await supabase
    .from('datasets')
    .select('data')
    .eq('id', 'main')
    .single();
  
  if (data) {
    window.DM4_DATASETS.main = data.data;
  }
}

// Subscribe to real-time changes
supabase
  .channel('dataset-changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'datasets',
    filter: 'id=eq.main'
  }, function(payload) {
    // Another user made a change
    state.actions.setDataset(DM4.dataset.normalize(payload.new.data));
    showToast("Dataset updated by another user");
  })
  .subscribe();

// Save edit to server
async function saveEditToServer(job) {
  // Apply job to current dataset
  var patchedDataset = applyJobToDataset(currentDataset, job);
  
  // Save to Supabase
  await supabase
    .from('datasets')
    .update({ data: patchedDataset, version: currentVersion + 1 })
    .eq('id', 'main');
  
  // Log to history
  await supabase
    .from('edit_history')
    .insert({ dataset_id: 'main', job: job });
}
```

---

## Implementation Priority

### Immediate (Part 1 - Editor Workflow)
1. "Apply Changes" button (apply without download)
2. "Export Dataset" button (download current state)
3. "Import Dataset" button (file upload)
4. LocalStorage persistence
5. "Reset to Default" button

### Future (Part 2 - Real-Time)
1. Phase 1: Database backend (Supabase)
2. Phase 2: Real-time sync
3. Phase 3: Presence UI
4. Phase 4: Authentication

---

## Related PRs

- PR #29: Backend for 20+ editor operations ✅ Merged
- PR #30: Fix duplication + tabbed editor UI ✅ Merged
- PR #31: Full ROUTES tab implementation (in progress)

---

*Document created: 2025-12-18*
