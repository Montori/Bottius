#!/bin/bash

################################################################################
#
# Using user input, creates the Bottius config file ('botconfig.json').
#
# Note: All variables not defined in this script are exported from
# 'linux-master-installer.sh', and 'debian-ubuntu-installer.sh' or
# 'centos-rhel-installer.sh'.
#
################################################################################
#
    clear
    read -p "We will now set up 'botconfig.json'. Press [Enter] to begin."

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
# User input that is saved to the Bottius config file
#
################################################################################
#
    echo -e "\n-------------"
    echo "${cyan}This field is required and cannot be left blank${nc}"
    while true; do
        read -p "Enter bot token: " bot_token
        if [[ -n $bot_token ]]; then break; fi
    done
    echo "Bot token: $bot_token"
    echo -e "-------------\n"

    echo "-------------"
    echo "${cyan}If left empty, default prefix will be used: !!${nc}"
    read -p "Enter Bottius's default prefix: " bot_prefix
    if [[ -z $bot_prefix ]]; then bot_prefix="!!"; fi
    echo "Bot Prefix: ${bot_prefix}"
    echo -e "-------------\n"

    # TODO: Figure out how to add multiple ID's/wrap quotes around userID's
    echo "-------------"
    echo -e "${cyan}This field is required and cannot be left blank\nNote: You" \
        "may only add one userID as a bot master via this method${nc}"
    while true; do
        read -p "Enter the bot master userID's: " masters
        if [[ -n $masters ]]; then
            break
        fi
    done
    echo "Bot Masters: $masters"
    echo -e "-------------\n"

    echo "-------------"
    echo "${cyan}If left empty, default activity and activity status will be used: PLAYING ready!${nc}"
    read -p "Enter bot activity (PLAYING|STREAMING|WATCHING|LISTENING): " activity
    read -p "Enter bot activity status (i.e. cat videos): " activity_status
    if [[ -z $activity ]]; then activity="PLAYING"; fi
    if [[ -z $activity_status ]]; then activity_status="ready!"; fi
    echo "Bot Activity: $activity"
    echo "Bot Activity Status: $activity_status"
    echo -e "-------------\n"

#
################################################################################
#
# Creates the Bottius config file or provides the user with a few options,
# if the config file already exists
#
################################################################################
#
    json="{
        \"token\": \"$bot_token\",
        \"prefix\": \"$bot_prefix\",
        \"masters\": [\"$masters\"],
        \"activity\": \"$activity\",
        \"activityStatus\": \"$activity_status\"
    }"

    if [[ ! -f source/botconfig.json ]]; then
        echo "Creating 'botconfig.json'..."
    else
        echo "Overwriting 'botconfig.json'..."
    fi

    # A.1 Piping json to jq formats the output into human-readable json format
    echo "$json" | jq . > source/botconfig.json || {
        echo "${red}Failed to create 'botconfig.json' in a human-readable" \
            "format${nc}" >&2
        echo "Creating 'botconfig.json' in a non-human-readable format..."
        echo "$json" > source/botconfig.json
    }

    if [[ -d out/ ]]; then
        echo "Re-compiling code..."
        tsc || {
            echo "${red}Failed to compile code${nc}" >&2
        }
        echo -e "\n${cyan}If there are any errors, resolve whatever issue is" \
            "causing them, then attempt to compile the code again\n${nc}"
    fi

    echo "Changing ownership of the file(s) added to '/home/bottius'..."
    chown bottius:bottius -R /home/bottius
    echo -e "\n${green}Finished setting up 'botconfig.json'${nc}"

#
################################################################################
#
# Restarts 'bottius.service' to load the new 'botconfig.json' for Bottius
#
################################################################################
#
    if [[ $bottius_service_status = "active" ]]; then
        timer=20
        # Saves the current time and date, which will be used with journalctl
        start_time=$(date +"%F %H:%M:%S")

        echo "Restarting 'bottius.service' to apply changes to 'botconfig.json'..."
        systemctl restart bottius.service || {
            echo "${red}Failed to restart 'bottius.service'" >&2
            echo "${cyan}You will need to manually restart 'bottius.service'" \
                "to apply the changes to 'botconfig.json'${nc}"
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
