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
    if [[ $sver = 7 ]]; then
        echo "Installing repository RPM..."
        yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm || {
            echo "${red}Failed to install the repo RPM" >&2
            echo "${cyan}The repo RPM required to download and install" \
                "Postgres${nc}"
            read -p "Press [Enter] to return to the installer menu"
            exit 1
        }
    else
        echo "Installing repository RPM..."
        dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm || {
            echo "${red}Failed to install the repo RPM" >&2
            echo "${cyan}The repo RPM required to download and install" \
                "Postgres${nc}"
            read -p "Press [Enter] to return to the installer menu"
            exit 1
        }

        echo "Disabling built in PostgreSQL module..."
        dnf -qy module disable postgresql || {
            echo "${red}Failed to disable the built in PostgreSQL module${nc}" >&2
        }
    fi

    echo "Installing Postgres..."
    yum install -y postgresql12-server  || {
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
    /usr/pgsql-12/bin/postgresql-12-setup initdb || {
        echo "${red}Failed to initialize the Postgres database${nc}" >&2
    }
    echo "Enabling 'postgresql-12.service'..."
    systemctl enable postgresql-12.service || {
        echo "${red}Failed to enable 'postgresql.service'" >&2
        echo "${cyan}'postgresql.service' must be enabled so that it is" \
            "automatically started on system reboot${nc}"
    }
    echo "Starting 'postgresql-12.service'..."
    systemctl start postgresql-12.service || {
        echo "${red}Failed to start 'postgresql.service'" >&2
        echo "${yellow}'postgresql.service' must be running for Bottiius to" \
            "work${nc}"
    }

    echo -e "\n${green}Finished installing Postgres${nc}"
    read -p "Press [Enter] to return to the installer menu"
