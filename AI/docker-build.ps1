$PROJECT_ID = "blindwikiai"
$REGION = "europe-west1"
$IMAGE_NAME = "europe-west1-docker.pkg.dev/blindwikiai/cloud-run-source-deploy/ai-server"
$IMAGE_TAG = "$REGION-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/$IMAGE_NAME"
# Or for Container Registry: $IMAGE_TAG = "gcr.io/$PROJECT_ID/$IMAGE_NAME"

Write-Host "Building Docker image..."
docker build -t $IMAGE_NAME .

# If build successful, push to registry
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful. Pushing to registry..."
    docker push $IMAGE_NAME
} else {
    Write-Error "Build failed!"
    exit 1
}

#gcloud artifacts repositories create cloud-run-source-deploy `
#--repository-format=docker `
#--location=europe-west1 `
#--description="Docker repository for Cloud Run deployments"

gcloud run deploy $IMAGE_NAME `
    --image "$IMAGE_TAG" `
    --platform managed `
    --region $REGION `
    --cpu 4 `
    --allow-unauthenticated `
    --memory 16Gi `
    --gpu 1 `
    --gpu-type nvidia-l4 `
    --no-cpu-throttling `
    --concurrency 8 `
    --max-instances 1 `
    --port 8080

