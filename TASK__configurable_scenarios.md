# Vision / Goal for feature "Configurable Scenarios"
We need a new feature to make the service more configurable for the users and their needs.

# Requirements

## Functionalities
- The user should be able to select the scenario from a list of predefined scenarios.
- The user should be able to create a new scenario.
- The user should be able to edit an existing scenario.
- The user should be able to delete an self created scenario.
- Language selection and usage of the seleected language should be the same as for the current implementation.
- The existing two scenarios food-product-image and not-a-food-product-image should be the first two hard coded scenarios.
- Scenarion selection should persist between page reloads.

## Scenario Entity
- The scenario entity should have the following fields:
  - id: string
  - name: string
  - instructions: string

## User Interface
- The selection should be above the password input field.
- The line currently saying "Take a photo of a grocery product to analyze its nutritional information" should depend on the selected scenario.
- Besides the dropdown, there should be a button to manage the scenarios.
- The management view should can take the whole part of the existing view below the header.
- The management view should be simple in the first attempt only listing the scenarios and allowing to edit and delete them.
- It should be the a third conditional view alongside Camera/Consent?
- The hard coded scenarions should be listed first as non-editable entries.

## Storage of the scenarios
- There are fixed scenarios delivered with the page. These scenarios are hard coded in the page.
- The user can create his own scenarios. These scenarios are stored in the browser's local storage.
- The user can edit and delete his own scenarios which are stored in the browser's local storage.
- A new scenario browser's local storage is to be created to hold all user created scenarios and the currently selected scenario.

### Implementation specific
- Create tests at first for the new features implementation and only for the parts that are newly implemented.
- Adapt existing tests that change due to the new features implementation.