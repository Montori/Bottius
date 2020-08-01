#!/bin/bash

################################################################################
#
# Takes care of installing Postgres 12. Postgres is installed using the
# instructions described here:
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
    echo "Updating packages..."
    yum -y update
    echo "Installing Postgres..."
    yum install postgresql-server  || {
        echo "${red}Failed to install Postgres${nc}" >&2
        read -p "Press [Enter] to return to the installer menu"
        exit 1
    }

#
################################################################################
#
# Starts and enables 'postgresql.service', and initializes Postgres database
#
################################################################################
#
    echo "Initializing Postgres database..."
    postgresql-setup --initdb || {
        echo "${red}Failed to initialize the Postgres database${nc}" >&2
    }
    echo "Enabling 'postgresql.service'..."
    systemctl enable postgresql.service || {
        echo "${red}Failed to enable 'postgresql.service'" >&2
        echo "${cyan}'postgresql.service' must be enabled so that it is" \
            "automatically started on system reboot${nc}"
    }
    echo "Starting 'postgresql.service'..."
    systemctl start postgresql.service || {
        echo "${red}Failed to start 'postgresql.service'" >&2
        echo "${yellow}'postgresql.service' must be running for Bottiius to" \
            "work${nc}"
    }

    echo -e "\n${green}Finished installing Postgres${nc}"
    read -p "Press [Enter] to return to the installer menu"
