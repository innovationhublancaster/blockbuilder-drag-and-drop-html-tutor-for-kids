Certainly! Below is a sample implementation of the `validationEngine.ts` module, which includes functions to run validation rules against student submissions. This module will take a submission and a set of validation rules, then execute each rule to check if the submission meets the criteria.

```typescript
// src/lib/validationEngine.ts

interface ValidationRule {
  id: string;
  name: string;
  condition: (submission: any) => boolean;
  message: string;
}

class ValidationEngine {
  private rules: ValidationRule[] = [];

  constructor(rules: ValidationRule[]) {
    this.rules = rules;
  }

  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  validate(submission: any): { valid: boolean; messages: string[] } {
    const results = this.rules.map(rule => ({
      id: rule.id,
      name: rule.name,
      passed: rule.condition(submission),
      message: rule.message
    }));

    const failedRules = results.filter(result => !result.passed);
    return {
      valid: failedRules.length === 0,
      messages: failedRules.map(failedRule => failedRule.message)
    };
  }
}

// Example usage:

const validationEngine = new ValidationEngine([
  {
    id: 'rule1',
    name: 'Check for required fields',
    condition: (submission) => submission.name && submission.age,
    message: 'Name and age are required.'
  },
  {
    id: 'rule2',
    name: 'Age must be a number',
    condition: (submission) => typeof submission.age === 'number',
    message: 'Age must be a number.'
  },
  {
    id: 'rule3',
    name: 'Name must be at least 3 characters long',
    condition: (submission) => submission.name.length >= 3,
    message: 'Name must be at least 3 characters long.'
  }
]);

const sampleSubmission = {
  name: 'John',
  age: 25
};

const validationResults = validationEngine.validate(sampleSubmission);
console.log(validationResults);

// Output:
// { valid: true, messages: [] }

export default ValidationEngine;
```

### Explanation:

1. **ValidationRule Interface**: Defines the structure of a validation rule, including an ID, name, condition function, and message.

2. **ValidationEngine Class**:
   - **Constructor**: Initializes the engine with an array of rules.
   - **addRule Method**: Adds a new rule to the engine.
   - **removeRule Method**: Removes a rule by its ID.
   - **validate Method**: Takes a submission and checks it against all registered rules. It returns an object indicating whether the submission is valid and any messages from failed rules.

3. **Example Usage**: Demonstrates how to create a `ValidationEngine` instance with some sample rules, validate a submission, and log the results.

This module can be expanded with more complex validation logic as needed.