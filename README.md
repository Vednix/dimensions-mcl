# Dimensions Mobile Compatibility Layer (Dimensions MCL)

## Know Bugs (✔ Fixed / ❕ Needs Revision / ❌ Hasn't been fixed yet)
- Protected tiles are not reversing after being changed. [✔]
- The liquids and blocks of sand are not falling. [✔]
- Mobile client crashing caused by SendTileSquare packet. [❕]
- Liquids are not merging. [❌]
	> I still couldn't solve this error directly in the extension, so i made partially fix using a TShock plugin [dimensions-mcl.forceliquidmerge](https://github.com/Vednix/dimensions-mcl.forceliquidmerge).
- Some legacy game messages. [❌]
	> I'll fix this using a TShock plugin, to make it easier to edit messages.

## Current State
Currently it's not complete. There are still issues to fix, some of which require a decision to be made on what the appropriate substitute functionality is.

## How to install
The release zip contains a folder, put this folder into your dimensions ``build/extensions`` folder and either use the cli to reloadextensions or restart your dimensions server. The extension currently does not support reloading the extension while live, as it will cause currently connected mobile clients to stop being considered as mobile.

## How does it work?
When a player first connects, their version is checked. If it matches the mobile version, the player is flagged as a mobile user and will be subject to packet rewriting by this extension. The extension intercepts incoming client packets and outgoing server packets and rewrites them to conform to the PC version (client -> server) or the mobile version (server -> client). In some cases it may not be possible to convert without losing information (such as tiles that do not exist in the client).

Most (but not all) of the changes are similar to what one would make for compatibility with the pc 1.3.0.7 version. This means we might be able to preempt the changes coming in future mobile versions and have the patches premade, even prebaked in so that the extension doesn't need to be updated to work for newer mobile versions. The important exception is the client's limit on players. Player ID 16 is used to identify the server "player" on mobile, which instead is 255 in the pc version. This means player ids 0-15 are the only ones usable on mobile for real players. This might change in the future, which will require the server player id to be updated to whatever the devs choose to change it to.

## How to build this extension
1. Clone repo
2. Run ``npm install`` in the root directory of the cloned repo
3. Run ``npm build``
4. Copy files from the build directory to a folder in your extensions directory of dimensions
