#!/bin/bash

################################################################################
#
# Installs Postgres 12. It is installed using the instructions described here:
# https://www.postgresql.org/download/linux/
#
# Note: All variables are exported from 'linux-master-installer.sh' and
# 'debian-ubuntu-installer.sh'.
#
################################################################################
#
    clear
    read -p "We will now download and install Postgres. Press [Enter] to begin."

#
################################################################################
#
# [ Main ]
#
# Installing Postgres
#
################################################################################
#
    echo "Importing public key..."
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add - || {
        echo "${red}Failed to import public key" >&2
        echo "${cyan}The public key is required to download and install" \
            "Postgres${nc}"
        read -p "Press [Enter] to return to the installer menu"
        exit 1
    }

    echo "Creating Postgres source file..."
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list' || {
        echo "${red}Failed to create Postgres source file" >&2
        echo "${cyan}The source file is required to download and install" \
            "Postgres${nc}"
        read -p "Press [Enter] to return to the installer menu"
        exit 1
    }

    echo "Updating packages..."
    apt update
    echo "Installing Postgres..."
    apt -y install postgresql-12 || {
        echo "${red}Failed to install Postgres${nc}" >&2
        read -p "Press [Enter] to return to the installer menu"
        exit 1
    }

#
################################################################################
#
# Starts and enables 'postgresql.service'
#
################################################################################
#
    echo "Enabling 'postgresql.service'..."
    systemctl enable postgresql.service || {
        echo "${red}Failed to enable 'postgresql.service'" >&2
        echo "${cyan}'postgresql.service' must be enabled so that it is" \
            "automatically started on system reboot${nc}"
    }
    echo "Starting 'postgresql.service'..."
    systemctl start postgresql.service || {
        echo "${red}Failed to start 'postgresql.service'" >&2
        echo "${cyan}'postgresql.service' must be running for Bottiius to" \
            "work${nc}"
    }

    echo -e "\n${green}Finished installing Postgres${nc}"
    read -p "Press [Enter] to return to the installer menu"
