$PROJECT_ID = "blindwikiai"
$REGION = "europe-southwest1"
$IMAGE_NAME = "ai-server"
$IMAGE_TAG = "$REGION-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/$IMAGE_NAME"
# Or for Container Registry: $IMAGE_TAG = "gcr.io/$PROJECT_ID/$IMAGE_NAME"

docker build -t "$IMAGE_TAG" .

docker push "${IMAGE_TAG}"

gcloud run deploy $IMAGE_NAME `
    --image "$IMAGE_TAG" `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --port 8080