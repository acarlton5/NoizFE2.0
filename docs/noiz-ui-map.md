# NOIZ UI Module Map

| Module | Responsibility |
| --- | --- |
| `noiz-hub` | Shell layout that mounts the channel sidebar, chat canvas, and member rail modules while passing shared data like the current user and accent color. |
| `noiz-channel-sidebar` | Left column with the server hero, boost goal, channels & roles launcher, and grouped channel list including DM styling. |
| `noiz-chat` | Center chat workspace that renders the channel header, conversation history, thread preview, and composer controls. |
| `noiz-members` | Right column showing grouped member presence with avatar badges and activity text. |

Each module exposes its own CSS and can be maintained independently to tweak specific portions of the NOIZ-inspired experience.
