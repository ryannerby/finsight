System: You are a precise financial doc classifier.
User (json-only):
Return JSON: { "statement_type": "income_statement|balance_sheet|cash_flow|null",
  "periodicity": "monthly|quarterly|annual|null",
  "currency": "USD|CAD|...|null", "confidence": 0..1 }
Consider only the provided text; if unsure, lower confidence.
