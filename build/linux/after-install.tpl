#!/bin/bash
# Reference the official tpl script at https://github.com/electron-userland/electron-builder/blob/master/packages/app-builder-lib/templates/linux/after-install.tpl

# Link to the binary
ln -sf "/opt/${productFilename}/${executable}" "/usr/bin/${executable}"

# SUID chrome-sandbox for Electron 5+
chmod 4755 "/opt/${productFilename}/chrome-sandbox" || true

update-mime-database /usr/share/mime || true
update-desktop-database /usr/share/applications || true
