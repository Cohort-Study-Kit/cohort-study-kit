# Forms Documentation

## Form Builder

Forms are defined using a JSON schema that specifies:
- Field types and validation
- Layout and appearance
- Dependencies and conditions

### Example Form Definition

```json
{
  "elements": [
    {
      "type": "input_question",
      "text": "Weight",
      "column": "weight",
      "validation": {
        "type": "number",
        "min": 0,
        "max": 200
      }
    }
  ]
}
```

## Form Types

1. **Input Questions**: For single data points
2. **Multi-column Questions**: For related data points
3. **Conditional Questions**: Show/hide based on other answers
4. **Calculated Fields**: Auto-populate based on formulas

## Validation

Forms support multiple validation types:
- Required fields
- Numeric ranges
- Date ranges
- Custom validation rules
