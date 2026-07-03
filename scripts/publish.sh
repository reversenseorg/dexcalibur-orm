#!/usr/bin/env bash
#
#     Reversense platform / dxc-struct :  Reversense is an automated reverse engineering and analysis platform
#     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
#     Copyright (C) 2026  Reversense SAS
#
#     This program is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published
#     by the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     This program is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with this program.  If not, see <https://www.gnu.org/licenses/>.
#
#

set -e

# Publish npm package within @dexcalibur scope
npm publish   # use @dexcalibur/<pkg> by default

# Switch scope to ublish npm package within @reversenseorg scope
cp package.json package.json.bak

npm pkg set name="@reversenseorg/dexcalibur-orm"
npm publish --registry=https://npm.pkg.github.com/

npm pkg set name="@reversense/dexcalibur-orm"
npm publish --registry=https://registry.npmjs.org/

mv package.json.bak package.json