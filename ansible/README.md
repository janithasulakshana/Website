# Ansible Configuration Management

This folder adds configuration management to the project using Ansible.

## Why Ansible Here

- Keep host and runtime config idempotent and version controlled
- Standardize backend environment configuration across dev/prod
- Bootstrap Linux hosts consistently before container deployment
- Prepare metadata used by monitoring/logging agents

## Structure

- `ansible/ansible.cfg`: Default Ansible config
- `ansible/inventories/dev/hosts.yml`: Dev inventory
- `ansible/inventories/prod/hosts.yml`: Prod inventory
- `ansible/inventories/*/group_vars/all.yml`: Environment-specific vars
- `ansible/playbooks/bootstrap-node.yml`: Host bootstrap (Docker + base dirs)
- `ansible/playbooks/configure-backend-env.yml`: Render backend env file
- `ansible/playbooks/configure-monitoring-agent.yml`: Monitoring/log metadata
- `ansible/templates/backend.env.j2`: Backend env template

## Run Examples

```bash
# Dev host bootstrap
ansible-playbook -i ansible/inventories/dev/hosts.yml ansible/playbooks/bootstrap-node.yml

# Render backend config for prod
ansible-playbook -i ansible/inventories/prod/hosts.yml ansible/playbooks/configure-backend-env.yml

# Configure monitoring metadata
ansible-playbook -i ansible/inventories/dev/hosts.yml ansible/playbooks/configure-monitoring-agent.yml
```

## CI Validation

Ansible syntax checks run via:

- `.github/workflows/ansible-check.yml`

## Secret Handling Note

Do not store real secrets in inventory files. Use Ansible Vault or inject values from CI/CD variables at runtime.
