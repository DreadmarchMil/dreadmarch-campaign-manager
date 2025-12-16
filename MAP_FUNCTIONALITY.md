# Interactive Map Functionality

This document outlines the features, behaviors, and user interactions for the interactive map functionality of the campaign manager app. The map serves as a core tool for data visualization and strategic roleplaying management.

---

### **Core Map Functionality**

#### **1. Marker System**
The marker system is at the heart of the map functionality, as markers will represent assets, events, characters, locations, and other key in-universe elements.

##### **1.1 Marker Creation**
- **Who Can Add Markers**:
  - **GMs**: Full access to create markers for any asset or event.
  - **Players**: Limited access to create markers within their permissions.
- **How to Add Markers**:
  - **GM Flow**:
    - Open a control (e.g., “Add Marker” button).
    - Click on the map to drop the marker at the desired location.
    - A form pops up to collect metadata (e.g., name, type, description, ownership).
    - Confirm to save the marker.
  - **Customization During Creation**:
    - Select marker type (e.g., Story Event, Faction Base).
    - Assign visibility scope (e.g., Public, Group, Personal).

##### **1.2 Marker Editing**
- **Editable Attributes**:
  - Marker name, type (or category), description, and ownership.
  - Marker position (dragging the marker to a new position).
  - Visibility scope (change marker access permissions).
- **How to Edit Markers**:
  - Click on an existing marker to open an edit popup.
  - Update attributes via a form.
  - Save changes, which reflect immediately on the map.

##### **1.3 Marker Deletion**
- **Who Can Delete Markers**:
  - **GMs** can delete any marker.
  - **Players** can delete their own markers (within permissions).
- **How to Delete Markers**:
  - Click on the marker to open a context menu or popup.
  - Select “Delete Marker” and confirm the action.

##### **1.4 Marker Types**
Markers should be categorized visually to improve clarity on the map. For example:
- **Story Events**: Blue pin icons.
- **Assets** (e.g., ships, bases): Green or ship-style icons.
- **Faction Points**: Red icons (for antagonist factions).
- **Custom/Other**: Option for unique or uncategorized markers.

---

#### **2. Layers and Filtering**
The map needs to handle data layering effectively to prevent visual clutter while allowing users to analyze different datasets intuitively.

##### **2.1 Layer Organization**
- Markers should be grouped into logical layers:
  - Examples:
    - **Story Events**
    - **Character-Owned Assets**
    - **Faction Bases**
    - **Political Boundaries**
- **How It Works**:
  - Each layer is toggleable via a side menu (check/uncheck to show or hide).
  - Users can view multiple layers simultaneously or focus on one layer.

##### **2.2 GM/Player-Specific Layer Views**
- **GM View**:
  - All layers visible.
  - Markers include additional “hidden” metadata (e.g., faction allegiances).
- **Player View**:
  - Only layers relevant to the player’s permissions.
  - Restricted markers hidden unless explicitly shared.

---

#### **3. Map Navigation**
Users need smooth and intuitive controls to explore the map effectively.

##### **3.1 Zoom and Pan**
- **Zoom Options**:
  - Scroll-to-zoom with scroll wheel.
  - Buttons for zooming in/out.
  - Optional: Double-click to zoom in on a specific region.
- **Pan Options**:
  - Click-and-hold drag to pan.
  - Touchscreen panning for tablet users.

##### **3.2 Legend/Focus Navigation**
- **Interactive Legend**:
  - A clickable legend that lists markers by layer or category.
  - Clicking a legend entry focuses the map view on the relevant marker.
- **Auto-focus Search Results**:
  - The search bar (details below in Section 4) automatically zooms and centers on searched markers or locations.

---

#### **4. Search and Locator**
A search feature is essential for quickly finding markers, assets, and locations across the map.

##### **4.1 Search Bar Functionality**
- **Enter Keywords Related To**:
  - Marker name (e.g., “Tython Outpost”).
  - Marker type (e.g., "Story Event").
  - Associated metadata (e.g., faction name, asset ID).
- **Results Include**:
  - Highlights of matching markers on the map.
  - Centering and zooming to selected results.

##### **4.2 Quick-Jump Menu**
- **Provide Shortcuts to High-Traffic Locations**:
  - E.g., “Sith Inquisition HQ,” “Battlefield of Jakka,” “Core Base.”

---

#### **5. Role and Permissions**
The map needs to display appropriately scoped data based on the user’s role.

##### **5.1 GM View**
- **Complete Visibility**:
  - All layers and markers.
  - View restricted/hidden markers with detailed metadata.
- **Full Control**:
  - Ability to create, edit, and delete markers across the board.

##### **5.2 Player View**
- **Limited Visibility Based on Granted Access**:
  - View layers and markers tied to their player/group.
  - Exclude hidden markers or sensitive GM data.

---

#### **6. Marker Popups**
Marker tooltips or popups provide context at-a-glance.

##### **Hover Popups**:
  - Display essential details when hovering over a marker:
    - Name, type, and owner.

##### **Clickable Popups**:
  - Expand the marker’s details when clicked:
    - Full description, editable fields (for GMs/owners), and actions.

---

#### **Battle Map Integration (Future Feature)**
- Planned feature to sync the interactive map with turn-based battle maps.
- Key goals:
  - Align markers with real-time updates during battles.
  - Allow GMs to shift game state dynamically on the map.