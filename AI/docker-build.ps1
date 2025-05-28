$PROJECT_ID = "blindwikiai"
$REGION = "europe-west1"
$IMAGE_NAME = "ai-server"
$IMAGE_TAG = "$REGION-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/$IMAGE_NAME"
# Or for Container Registry: $IMAGE_TAG = "gcr.io/$PROJECT_ID/$IMAGE_NAME"

docker build -t "$IMAGE_TAG" .

#gcloud artifacts repositories create cloud-run-source-deploy `
#--repository-format=docker `
#--location=europe-west1 `
#--description="Docker repository for Cloud Run deployments"

docker push "${IMAGE_TAG}"

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

