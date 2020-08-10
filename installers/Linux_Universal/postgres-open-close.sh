#!/bin/bash

################################################################################
#
# Configures Postgres to either allow or deny external connections to the
# database.
#
# Note: All variables not defined in this script are exported from
# 'linux-master-installer.sh', and 'debian-ubuntu-installer.sh' or
# 'centos-rhel-installer.sh'.
#
################################################################################
#
# Global [variables]
#
################################################################################
#
    pg_hba="/var/lib/pgsql/12/data/pg_hba.conf"
    gres="/var/lib/pgsql/12/data/postgresql.conf"
    hba_open="^host .* all .* all .* 0.0.0.0\/0 .* (md5|ident)$"
    gres_open="^listen_addresses = '\*'"
    hba_close="^host .* all .* all .* (127.0.0.1(\/([0-9]|[1-2][0-9]|3[0-2]))?|localhost) .* (ident|md5)$"
    gres_close="^.?listen_addresses = ('127.0.0.1(\/([0-9]|[1-2][0-9]|3[0-2]))?'|'localhost')"
    gres_close2="^#listen_addresses = '.*'"

#
################################################################################
#
# [ Functions ]
#
################################################################################
#
    # Confirms that the user wants to open Postgres to external connections
    are_you_sure() {
        verify_choice=$((RANDOM % 10))$((RANDOM % 10))$((RANDOM % 10))
        echo "${yellow}WARNING: By choosing this option, you are opening" \
            "Postgres to external connections to the database. This posses" \
            "as a grave security risk. So to better protect the server/database" \
            "you are required to enabled authentication for Postgres (that of" \
            "which is used by default).${nc}"
        echo "To confirm that you want to do this and you understand the" \
            "security risk, please enter the corresponding three digit" \
            "number: ${cyan}${verify_choice}${nc}"
        read -p "Please enter the confirmation number: " number

        if [[ $number = $verify_choice ]]; then
            return 0
        else
            echo "${red}The numbers do not match${nc}"
            read -p "Press [Enter] to return to the advanced options menu"
            return 1
        fi
    }

    # Determins whether or not it is neccessary to call 'are_you_sure' based on
    #the actions the user wants to perform, and the current status of Postgres
    pgsql_status_check() {
        if [[ $pgsql_status = "open" ]]; then
            if [[ $1 = "open" ]]; then
                clear
                echo "${cyan}External connections are already ALLOWED${nc}"
                return 1
            else
                return 0
            fi
        elif [[ $pgsql_status = "close" ]]; then
            if [[ $1 = "open" ]]; then
                are_you_sure && return 0 || clear && return 1
            else
                clear
                echo "${cyan}External connections are already DENIED${nc}"
                return 1
            fi
        elif [[ $pgsql_status = "partial" ]]; then
            if [[ $1 = "open" ]]; then 
                are_you_sure && return 0 || clear && return 1
            else
                return 0
            fi
        elif [[ $pgsql_status = "unkown" ]]; then
            echo "${yellow}Due to the unkown status, no changes will be made${nc}"
            return 1
        fi
    }

#
################################################################################
#
# [ Main ]
#
################################################################################
#
    while true; do
        pgsql_hba_opened=$(grep -P "$hba_open" "$pg_hba")
        pgsql_gres_opened=$(grep -P "$gres_open" "$gres")
        pgsql_hba_closed=$(grep -P "$hba_close" "$pg_hba")
        pgsql_gres_closed=$(grep -P "$gres_close" "$gres")
        pgsql_gres_closed2=$(grep -P "$gres_close2" "$gres")

        clear
        echo "Advanced Options Menu"

        if [[ $pgsql_hba_opened && $pgsql_gres_opened ]]; then
            echo -e "Postgres external connection status: ${cyan}Open\n${nc}"
            pgsql_status="open"
        elif [[ $pgsql_hba_closed && ($pgsql_gres_closed || $pgsql_gres_closed2) ]]; then
            echo -e "Postgres external connection status: ${cyan}Closed\n${nc}"
            pgsql_status="close"
        elif [[ $pgsql_hba_opened && ($pgsql_gres_closed || $pgsql_gres_closed2) ||
                $pgsql_hba_closed && $pgsql_gres_opened ]]; then
            echo -e "Postgres external connection status: ${cyan}Partially\n${nc}"
            pgsql_status="partial"
        else
            echo -e "Postgres external connection status: ${cyan}Unkown\n${nc}"
            pgsql_status="unkown"
        fi

        echo "1. OPEN Postgres to external connections"
        echo "2. CLOSE Postgres to external connections"
        echo "3. Return to the installer menu"
        read option
        case "$option" in
            1)
                clear
                pgsql_status_check "open" || continue
                clear
                printf "We will now OPEN external connection to Postgres. "
                read -p "Press [Enter] to continue."

                echo "Modifying '$pg_hba'..."
                if [[ $pgsql_hba_closed ]]; then
                    sed -i "s/^host .* all .* all .* \(127.0.0.1\(\/\([0-9]\|[1-2][0-9]\|3[0-2]\)\)\?\|localhost\) .* \(ident\|md5\)$/host   all   all   0.0.0.0\/0   md5/g" "$pg_hba" || {
                        echo "${red}Failed to modify '$pg_hba'${nc}" >&2
                    }
                else
                    echo "${cyan}External connections are already ALLOWED${nc}"
                fi

                echo "Modifying '$gres'..."
                if [[ ($pgsql_gres_closed || $pgsql_gres_closed2) ]]; then
                    if [[ $pgsql_gres_closed ]]; then
                        sed -i "s/$gres_close/listen_addresses = '\*'/g" "$gres" || {
                            echo "${red}Failed to modify '$gres'${nc}" >&2
                        }
                    else
                        sed -i "s/$gres_close2/listen_addresses = '\*'/g" "$gres" || {
                            echo "${red}Failed to modify '$gres'${nc}" >&2
                        }
                    fi
                else
                    echo "${cyan}External connections are already ALLOWED${nc}"
                fi

                read -p "Press [Enter] to return to the advanced options menu"
                clear
                ;;
            2)
                clear
                pgsql_status_check "close" || continue
                clear
                printf "We will now CLOSE external connection to Postgres. "
                read -p "Press [Enter] to continue."

                echo "Modifying '$pg_hba'..."
                if [[ $pgsql_hba_closed ]]; then
                    echo "${cyan}External connections are already DENIED${nc}"
                else
                    sed -i "s/^host .* all .* all .* 0.0.0.0\/0 .* \(md5\|ident\)$/host   all   all   127.0.0.1\/32   md5/g" "$pg_hba" || {
                        echo "${red}Failed to modify '$pg_hba'${nc}" >&2
                    }
                fi

                echo "Modifying '$gres'..."
                if [[ ($pgsql_gres_closed || $pgsql_gres_closed2) ]]; then
                    echo "${cyan}External connections are already DENIED${nc}"
                else
                    sed -i "s/$gres_open/#listen_addresses = '\*'/g" "$gres" || {
                        echo "${red}Failed to modify '$gres'${nc}" >&2
                    }
                fi

                read -p "Press [Enter] to return to the advanced options menu"
                clear
                ;;
            3)
                echo -e "\nReturning to the installer menu..."
                exit 0
                ;;
            *)
                clear
                echo "${red}Invalid input: '$option' is not a valid" \
                    "option${nc}" >&2
        esac
    done
