# Data Model Documentation

## Core Models

### Proband
Represents a study participant. Contains:
- Basic information (name, ID, etc.)
- Status tracking
- Demographic data

### Visit
Represents a participant visit. Contains:
- Visit type
- Date
- Status
- Associated examinations

### Examination
Represents data collected during a visit. Contains:
- Dataset reference
- Collection date
- Status
- Form data

### Dataset
Defines the structure of collected data. Contains:
- Schema definition
- Form layout
- Validation rules
