# Spec Delta: ConfirmActionModal

## ADDED Requirements

### Requirement: Confirm Action Modal Component
The system MUST provide a reusable modal component for confirming user actions, supporting destructive and safe operations.

#### Scenario: Displaying a Destructive Confirmation
Given a user initiates a delete action
When the `ConfirmActionModal` opens with `variant="danger"`
Then the modal should display a red confirm button
And the detailed description of the action
And an icon indicating a warning/danger state on the right side.

#### Scenario: Confirming an Action
Given the modal is open
When the user clicks the "Confirm" button
Then the `onConfirm` callback should be triggered
And if the callback returns a promise, the button should show a loading state
And the cancel button should optionally be disabled.

#### Scenario: Canceling an Action
Given the modal is open
When the user clicks "Cancel" or double-clicks the backdrop
Then the `onCancel` callback should be triggered
And the modal should close (controlled by parent state).
