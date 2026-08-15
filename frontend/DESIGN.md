# GeoNER Frontend Design System

## Product

GeoNER — Identification & Disambiguation of Place Names from Natural Language Text for ISRO's Bhuvan.

## Design Direction

The interface is designed as a modern geospatial intelligence dashboard.

The visual language communicates:

- geographic intelligence
- clarity
- reliability
- data analysis
- professional mapping
- trustworthy location resolution

The interface should avoid looking like a generic Tailwind template.

## Color Palette

### Primary
Deep Navy: `#0F172A`

Used for:
- main headings
- important text
- primary actions

### Geographic Accent
Blue: `#2563EB`

Used for:
- interactive controls
- geographic actions
- selected states

### Resolution Accent
Emerald: `#059669`

Used for:
- successful location resolution
- confidence indicators
- resolved-location status

### Entity Highlight
Amber: `#F59E0B`

Used for:
- detected place names
- NLP entity highlighting
- attention states

### Background
Slate: `#F8FAFC`

Used for:
- page background
- application surfaces

## Typography

The interface uses a clean system sans-serif style with emphasis on:

- readability
- clear hierarchy
- concise labels
- accessible data presentation

## Component Style

### Cards

Cards use:

- rounded corners
- subtle borders
- light shadows
- consistent spacing

### Buttons

Primary actions use strong geographic blue or deep navy.

### Entity Highlights

Detected place names are highlighted using amber so that NLP results are immediately distinguishable from normal text.

### Confidence Indicators

Resolved locations use emerald indicators to communicate successful geographic resolution.

### Map

Leaflet is used for geographic visualization and resolved-location markers.

## Layout

The main interface follows this flow:

1. Application header
2. Sentence input
3. Highlighted text
4. Resolved locations
5. Geographic map

The layout should remain readable across desktop and smaller screens.

## Design Principle

The interface should make the following relationship immediately understandable:

Natural Language Text
→ Detected Place
→ Resolved Location
→ Geographic Map

The goal is to make geographic entity recognition understandable to a user without requiring them to understand the underlying NLP system.