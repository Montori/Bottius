#!/bin/bash

################################################################################
#
# Using user input, creates the database config file ('ormconfig.json').
#
# Note: All variables not defined in this script are exported from
# 'linux-master-installer.sh', and 'debian-ubuntu-installer.sh' or
# 'centos-rhel-installer.sh'.
#
################################################################################
#
    clear
    read -p "We will now set up 'ormconfig.json'. Press [Enter] to begin."

    epel_installed=false

#
################################################################################
#
# [ Functions ]
#
################################################################################
#
    epel_and_pkg() {
        # CentOS and RHEL use the yum/dnf package manager while Debian and
        # Ubuntu use apt
        if [[ $distro = "centos" || $distro = "rhel" ]]; then
            # EPEL must be installed in order to install jq and during
            if [[ $sver = "7" ]]; then
                if [[ $epel_installed = false ]]; then
                    yum -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm && epel_installed=true || {
                        echo "${red}Failed to install Extra Packages for" \
                            "Enterprise Linux${nc}" >&2
                    }
                fi
                pkg_manager="yum"
            else
                if [[ $epel_installed = false ]]; then
                    dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm && epel_installed=true || {
                        echo "${red}Failed to install Extra Packages for" \
                            "Enterprise Linux${nc}" >&2
                    }

                fi
                pkg_manager="dnf"
            fi
        else
            pkg_manager="apt"
        fi
    }
#
################################################################################
#
# Checking for required software/applications
#
################################################################################
#
    if ! hash jq &>/dev/null; then
        echo "${yellow}jq is not installed${nc}"
        epel_and_pkg
        echo "Installing jq..."
        "$pkg_manager" -y install jq || {
            echo "${red}Failed to install jq" >&2
            echo "${cyan}jq is required to create nicely formated json files${nc}"
        }
    fi

#
################################################################################
#
# User input that is saved to the Postgres config file
#
################################################################################
#
    echo "-------------"
    echo -e "${cyan}This field is required and cannot be left blank\nURL" \
        "Format: postgres://[DB_USER]:[DB_USER_PASSWORD]@[DB_HOST]:[DB_PORT]/[DB_NAME]" \
        "\nExample: postgres://Bottius:Pa\$\$w0rd@localhost:5432/Bottius_DB\nNote:" \
        "Default port number: 5432${nc}"
    while true; do
        read -p "Enter Postgres URL: " postgres_url
        if [[ -n $postgres_url ]]; then
            break
        fi
    done
    echo "Postgres URL: $postgres_url"
    echo -e "-------------\n"

#
################################################################################
#
# Creates the Postgres config file or provides the user with a few options,
# if the config file already exists
#
################################################################################
#
    json="{
        \"type\": \"postgres\",
        \"url\": \"$postgres_url\",
        \"entities\": [\"out/Entities/Persistent/*.js\"],
        \"migrations\": [\"out/Migration/*.js\"],
        \"cli\": {
            \"migrationsDir\": \"source/Migration\"
        }
    } 
"

    if [[ ! -f ormconfig.json ]]; then
        echo "Creating 'ormconfig.json'..."
    else
        echo "Overwriting 'ormconfig.json'..."
    fi

    # A.1 Piping json to jq formats the output into human-readable json format
    echo "$json" | jq . > ormconfig.json || {
        echo "${red}Failed to create 'ormconfig.json' in a human-readable" \
            "format${nc}" >&2
        echo "Creating 'ormconfig.json' in a non-human-readable format..."
        echo "$json" > ormconfig.json
    }

    echo "Changing ownership of the file(s) added to '/home/bottius'..."
    chown bottius:bottius -R /home/bottius
    echo -e "\n${green}Finished setting up 'ormconfig.json'${nc}"

#
################################################################################
#
# Restarts 'bottius.service' to load the new 'ormconfig.json' for Bottius
#
################################################################################
#
    if [[ $bottius_service_status = "active" ]]; then
        timer=20
        # Saves the current time and date, which will be used with journalctl
        start_time=$(date +"%F %H:%M:%S")

        echo "Restarting 'bottius.service' to apply changes to 'ormconfig.json'..."
        systemctl restart bottius.service || {
            echo "${red}Failed to restart 'bottius.service'" >&2
            echo "${cyan}You will need to manually restart 'bottius.service'" \
                "to apply the changes to 'ormconfig.json'${nc}"
            read -p "Press [Enter] to return to the installer menu"
            exit 1
        }
        
        # Waits in order to give 'bottius.service' enough time to restart
        echo "Waiting 20 seconds for 'bottius.service' to start..."
        while ((timer > 0)); do
            echo -en "${clrln}${timer} seconds left"
            sleep 1
            ((timer-=1))
        done
        
        # Lists the startup logs in order to better identify if and when
        # an error occurred during the startup of 'bottius.service'
        # Note: $no_hostname is purposefully unquoted. Do not quote those
        # variables
        echo -e "\n\n-------- bottius.service startup logs ---------" \
            "\n$(journalctl -u bottius -b $no_hostname -S "$start_time")" \
            "\n--------- End of bottius.service startup logs --------\n"

        echo -e "Please check the logs above to make sure that there aren't" \
            "any errors, and if there are, to resolve whatever issue is" \
            "causing them\n"
    fi

    read -p "Press [Enter] to return to the installer menu"
