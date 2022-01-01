#
# Provide local weather data to remote server.
#
# Copyright (C) 2021  Daniele Tentoni
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

FROM node:17-alpine

ENV WORKINGDIR=/app

RUN mkdir -p ${WORKINGDIR}

WORKDIR ${WORKINGDIR}

# Install dependecies

COPY ./package*.json ${WORKINGDIR}/

RUN npm install --silent

# Copy app source code

COPY ./src ${WORKINGDIR}/src

RUN adduser -D myuser
USER myuser

# Hidden by Heroku
# EXPOSE 15600

CMD ["npm", "start"]