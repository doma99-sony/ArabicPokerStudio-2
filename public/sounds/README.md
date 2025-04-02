# Sound Files Directory

This directory contains sound files for the poker game application. The sounds are organized into different categories:

## Categories

- **ui**: User interface sounds (button clicks, menu navigation, etc.)
- **game**: Game action sounds (cards, chips, player actions)
- **ambient**: Background music and ambient sounds
- **win**: Celebration and winning sounds
- **notification**: Alerts and notifications

## Usage in Application

The sounds are accessed through the `useSoundSystem` hook in `client/src/hooks/use-sound-system.tsx`.

To add new sounds:
1. Place the sound file in the appropriate category folder
2. Add the sound ID and path in the `soundPaths` object in the sound system hook
3. Add the correct category mapping in the `soundCategories` object

## Sound Formats

For best compatibility across browsers, use MP3 format for all sound files.