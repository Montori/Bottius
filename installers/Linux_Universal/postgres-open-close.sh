#!/bin/bash

################################################################################
#
# The sub-master installer that is used on CentOS and RHEL Linux
# distributions.
#
# Note: All variables not defined in this script, are exported from
# 'linux-master-installer.sh'.
#
################################################################################
#
    clear
    pg_hba="/var/lib/pgsql/12/data/pg_hba.conf"
    gres="/var/lib/pgsql/12/data/postgresql.conf"


#
################################################################################
#
# [ Functions ]
#
################################################################################
#
    are_you_sure() {
        verify_choice=$((RANDOM % 10))$((RANDOM % 10))$((RANDOM % 10))
        echo "${yellow}WARNING: By choosing this option and opening Postgres" \
            "to the outside world, you will be allowing users outside the" \
            "server attempt to connect to the database. So if you have not" \
            "already enabled authentication for Postgres, (used by default)" \
            "do it now.${nc}"
        echo "To verify that you want to follow through with this, please enter" \
            "the corresponding numbers: ${cyan}${verify_choice}${nc}"
        read -p "Please enter the number above, here: " number

        if [[ $number = $verify_choice ]]; then
            return 0
        else
            echo "${red}The numbers do not match${nc}"
            read -p "Please enter to return to the adnvanced option menu"
            return 1
        fi
    }

    pgsql_status_check() {
        if [[ $pgsql_status = "open" ]]; then
            if [[ $1 = "open" ]]; then
                clear
                echo "${yellow}Already open to outside of the server${nc}"
                return 1
            else
                return 0
            fi
        elif [[ $pgsql_status = "close" ]]; then
            if [[ $1 = "open" ]]; then
                are_you_sure && return 0 || clear && return 1
            else
                clear
                echo "${yellow}Already closed to outside of the server${nc}"
                return 1
            fi
        elif [[ $pgsql_status = "partial" ]]; then
            if [[ $1 = "open" ]]; then 
                are_you_sure && return 0 || clear && return 1
            else
                return 0
            fi
        elif [[ $pgsql_status = "unkown" ]]; then
            echo "${yellow}Due to the unkown status, there will be no changes${nc}"
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
        hba_open="^host .* all .* all .* 0.0.0.0\/0 .* (md5|ident)$"
        gres_open="^listen_addresses = '\*'"
        hba_close="^host .* all .* all .* (127.0.0.1(\/([0-9]|[1-2][0-9]|3[0-2]))?|localhost) .* (ident|md5)$"
        gres_close="^.?listen_addresses = ('127.0.0.1(\/([0-9]|[1-2][0-9]|3[0-2]))?'|'localhost')"
        gres_close2="^#listen_addresses = '.*'"

        pgsql_hba_opened=$(grep -P "$hba_open" "$pg_hba")
        pgsql_gres_opened=$(grep -P "$gres_open" "$gres")
        pgsql_hba_closed=$(grep -P "$hba_close" "$pg_hba")
        pgsql_gres_closed=$(grep -P "$gres_close" "$gres")
        pgsql_gres_closed2=$(grep -P "$gres_close2" "$gres")

        echo "Advanced Options Menu"

        if [[ $pgsql_hba_opened && $pgsql_gres_opened ]]; then
            echo -e "Is Postgres database accessible from outside of the server:" \
                "${cyan}Yes\n${nc}"
            pgsql_status="open"
        elif [[ $pgsql_hba_closed && ($pgsql_gres_closed || $pgsql_gres_closed2) ]]; then
            echo -e "Is Postgres database accessible from outside of the server:" \
                "${cyan}No\n${nc}"
            pgsql_status="close"
        elif [[ $pgsql_hba_opened && ($pgsql_gres_closed || $pgsql_gres_closed2) ||
                $pgsql_hba_closed && $pgsql_gres_opened ]]; then
            echo -e "Is Postgres database accessible from outside of the server:" \
                "${cyan}Partially\n${nc}"
            pgsql_status="partial"
        else
            echo -e "Is Postgres database accessible from outside of the server:" \
                "${cyan}Unkown\n${nc}"
            pgsql_status="unkown"
        fi

        echo "1. Make Postgres database accessible from outside of the server"
        echo "2. Make Postgres database only accessible from within the server"
        echo "3. Return to installer menu"
        read option
        case "$option" in
            1)
                clear
                pgsql_status_check "open" || continue
                clear
                read -p "Press [Enter] to continue and open Postgres to the world"

                echo "Modifying '$pg_hba'..."
                if [[ $pgsql_hba_closed ]]; then
                    sed -i "s/^host .* all .* all .* \(127.0.0.1\(\/\([0-9]\|[1-2][0-9]\|3[0-2]\)\)\?\|localhost\) .* \(ident\|md5\)$/host   all   all   0.0.0.0\/0   md5/g" "$pg_hba" || {
                        echo "${red}Failed to modify $pg_hba$nc" >&2
                    }
                else
                    echo "Already set to open"
                fi

                echo "Modifying '$gres'..."
                if [[ ($pgsql_gres_closed || $pgsql_gres_closed2) ]]; then
                    if [[ $pgsql_gres_closed ]]; then
                        sed -i "s/$gres_close/listen_addresses = '\*'/g" "$gres" || {
                            echo "${red}Failed to modify $gres$nc" >&2
                        }
                    else
                        sed -i "s/$gres_close2/listen_addresses = '\*'/g" "$gres" || {
                            echo "${red}Failed to modify $gres$nc" >&2
                        }
                    fi
                else
                    echo "Already set to open"
                fi

                read -p "Press [Enter] to return to the Advanced Options Menu"
                clear
                ;;
            2)
                clear
                pgsql_status_check "close" || continue
                clear
                read -p "Press [Enter] to continue and close Postgres to the world"

                echo "Modifying '$pg_hba'..."
                if [[ $pgsql_hba_closed ]]; then
                    echo "Already set to close"
                else
                    sed -i "s/^host .* all .* all .* 0.0.0.0\/0 .* \(md5\|ident\)$/host   all   all   127.0.0.1\/32   md5/g" "$pg_hba" || {
                        echo "${red}Failed to modify $pg_hba$nc" >&2
                    }
                fi

                echo "Modifying '$gres'..."
                if [[ ($pgsql_gres_closed || $pgsql_gres_closed2) ]]; then
                    echo "Already set to close"
                else
                    sed -i "s/$gres_open/#listen_addresses = '\*'/g" "$gres" || {
                        echo "${red}Failed to modify $gres$nc" >&2
                    }
                fi

                read -p "Press [Enter] to return to the Advanced Options Menu"
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
