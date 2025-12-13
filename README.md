# Dreadmarch Campaign Manager

A campaign manager app for tabletop RPGs, designed to assist Game Masters (GMs) and players with real-time collaboration, state management, user-configurable datasets, and in-game asset tracking.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Development](#development)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Web-Hosted**: Accessible online for real-time GM/player collaboration
- **Interactive Galactic Map**: Visual representation of star systems, routes, and sectors
- **Key-Based Access Control**: Define user roles for dynamically adjusted permissions
- **Asset Management System**: Tools for tracking, buying, and requesting assets tied to the game world
- **State Management**: Centralized state management with subscription-based updates and scoped notifications
- **Dataset Normalization**: Robust handling of galactic system data with automatic consolidation
- **Extensible Architecture**: Modular design allows easy addition of new panels, actions, and layers

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kitirynrousseau/dreadmarch-campaign-manager.git
   cd dreadmarch-campaign-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run tests** to verify installation:
   ```bash
   npm test
   ```

4. **Open the application**:
   - Open `index.html` directly in your browser, or
   - Use a local web server (recommended):
     ```bash
     # Using Python 3
     python3 -m http.server 8000
     
     # Using Node.js http-server
     npx http-server -p 8000
     ```
   - Navigate to `http://localhost:8000`

For detailed setup instructions and contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

```bash
npm install
```

### Running Tests

This project uses [Jest](https://jestjs.io/) as the testing framework.

#### Run all tests

```bash
npm test
```

#### Run tests in watch mode

Watch mode will automatically re-run tests when files change:

```bash
npm run test:watch
```

#### Run tests with coverage

Generate a coverage report to see how much of the code is covered by tests:

```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

### Test Structure

Tests are located in the `__tests__/` directory and follow the naming convention `*.test.js`.

Current test coverage includes:

- **dm4-dataset-core.test.js**: Tests for dataset normalization functionality
  - Valid dataset normalization with systems, pixels, grids, and sectors
  - Invalid input handling (null, undefined, non-objects)
  - Edge cases (null values, multiple sectors, empty arrays)

- **dm4-state.test.js**: Tests for state manager behavior
  - State manager creation and initialization
  - Subscribe and notify patterns
  - State actions (selectSystem, setMode, setDataset, setCampaign, setAccess)
  - Editor state management
  - State immutability

### Writing Tests

When adding new features:

1. Create a test file in `__tests__/` with the `.test.js` extension
2. Import or require the module you want to test
3. Write test cases using Jest's `describe` and `test` functions
4. Run tests to ensure they pass

Jest configuration is managed in `jest.config.js` at the root of the project.

Example test structure:

```javascript
describe('My Module', () => {
  test('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

## Documentation

### Core Documentation

- **[Architecture Overview](docs/architecture.md)** - High-level system architecture, module interactions, and data flow
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute, development standards, and workflow
- **[Development Protocol](Dreadmarch_Development_Protocol_v1.5.txt)** - Detailed technical protocol and rules

### Key Concepts

- **State Management**: Centralized state with immutable updates, scoped subscriptions, and batch notifications
- **Dataset Normalization**: Automatic consolidation of system data from multiple sources
- **Module System**: Namespace-based IIFE modules for clean separation of concerns
- **Panel Contract**: Consistent interface for UI components (`render()` and `destroy()`)

### Quick Links

- [How to add a new panel](docs/architecture.md#adding-a-new-panel)
- [How to add a new state action](docs/architecture.md#adding-a-new-state-action)
- [Understanding the data flow](docs/architecture.md#data-flow)
- [Module loading order](docs/architecture.md#module-loading-order)

## Project Structure

```
.
├── __tests__/                  # Test files
│   ├── dm4-dataset-core.test.js
│   └── dm4-state.test.js
├── docs/                       # Documentation
│   └── architecture.md         # Architecture overview
├── dm4-runtime.js              # Core runtime initialization
├── dm4-dataset-core.js         # Dataset normalization module
├── dm4-dataset-main.js         # Main dataset definitions
├── dm4-state.js                # State management module
├── dm4-map-layers.js           # Map layer rendering
├── dm4-panels-*.js             # UI panel components
│   ├── dm4-panels-identity.js  # System identity panel
│   ├── dm4-panels-editor.js    # Dataset editor panel
│   ├── dm4-panels-test.js      # Test panel
│   └── dm4-panels-registry.js  # Panel management
├── dm4-style-core.js           # Style and palette management
├── dm4-ui-controlbar.js        # Control bar UI
├── dreadmarch-viewer4.js       # Main application bootstrap
├── index.html                  # Application entry point
├── package.json                # Project configuration
├── jest.config.js              # Jest configuration
├── CONTRIBUTING.md             # Contribution guidelines
└── README.md                   # This file
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup and workflow
- Coding standards and conventions
- Testing guidelines
- Pull request process
- Code of conduct

Key points:
- Run `npm test` before submitting
- Follow ES5 syntax for browser compatibility
- Use the DM4.Logger for all diagnostic messages
- Write tests for new features
- Update documentation when making architectural changes

## License

ISC
