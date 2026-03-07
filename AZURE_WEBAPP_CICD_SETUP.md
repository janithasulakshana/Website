# Azure Web App CI/CD Setup (Azure DevOps)

This project includes a ready pipeline at [azure-pipelines-webapp.yml](azure-pipelines-webapp.yml) to:

1. Build and push backend and frontend Docker images
2. Deploy each image to its own Azure Web App (Container)
3. Configure backend runtime settings securely from pipeline variables

## 1) Create Azure resources

Create two Linux Web Apps (Container):

- Backend app (example): `website-backend-app`
- Frontend app (example): `website-frontend-app`

Both should be in the same resource group (example): `website-rg`.

## 2) Azure authentication (pipeline variables)

This pipeline uses `az login --service-principal`, so no Azure DevOps service connection is required.

## 3) Add pipeline variables

In Azure DevOps Pipeline > Edit > Variables, add:

Required (plain):
- `resourceGroupName` = `website-rg`
- `backendWebAppName` = `website-backend-app`
- `frontendWebAppName` = `website-frontend-app`
- `CORS_ORIGIN` = `https://<your-frontend-domain>`
- `FRONTEND_API_BASE_URL` = `https://<your-backend-domain>` (used at frontend image build time)
- `registryProvider` = `dockerhub` or `acr`
- `backendRepositoryName` = `website-backend`
- `frontendRepositoryName` = `website-frontend`
- `AZURE_CLIENT_ID` = `<service-principal-app-id>`
- `AZURE_TENANT_ID` = `<tenant-id>`
- `AZURE_SUBSCRIPTION_ID` = `<subscription-id>`

Required (secret):
- `JWT_SECRET` = `<strong-random-secret>`
- `AZURE_CLIENT_SECRET` = `<service-principal-secret>`

If `registryProvider=dockerhub`:

Required (plain):
- `dockerhubNamespace` = `<your-dockerhub-username-or-org>`
- `DOCKERHUB_USERNAME` = `<your-dockerhub-username>`

Required (secret):
- `DOCKERHUB_PASSWORD` = `<your-dockerhub-password-or-access-token>`

If `registryProvider=acr`:

Required (plain):
- `acrName` = `<your-acr-name>`
- `acrLoginServer` = `<your-acr-name>.azurecr.io`
- `ACR_USERNAME` = `<acr-admin-username>`

Required (secret):
- `ACR_PASSWORD` = `<acr-admin-password>`

## 4) Run pipeline

1. In Azure DevOps, create a new pipeline using [azure-pipelines-webapp.yml](azure-pipelines-webapp.yml)
2. Run the pipeline
3. On `main` branch pushes, it will build + deploy automatically

## 5) Verify deployment

Check backend:

- Open: `https://<backend-app>.azurewebsites.net/api/test`

Check frontend:

- Open: `https://<frontend-app>.azurewebsites.net`

## Notes

- The backend stores SQLite at `/home/site/data/bookings.db` in Web App persistent storage.
- The frontend Web App pipeline now uses [Dockerfile.frontend.prod](Dockerfile.frontend.prod), which builds static assets and serves them with Nginx.
- Frontend SPA routing fallback is configured in [nginx/frontend.conf](nginx/frontend.conf).
