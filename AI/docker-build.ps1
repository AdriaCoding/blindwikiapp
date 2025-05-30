$PROJECT_ID = "blindwikiai"
$REGION = "europe-west1"
$SERVICE_NAME = "ai-server"
$IMAGE_NAME = "$REGION-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/$SERVICE_NAME"

Write-Host "Building Docker image..."
docker build -t $IMAGE_NAME .

# If build successful, push to registry
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful. Pushing to registry..."
    docker push $IMAGE_NAME

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Pushing successful. Deploying to Cloud Run..."
        gcloud run deploy $SERVICE_NAME `
            --image "$IMAGE_NAME" `
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

        if ($LASTEXITCODE -eq 0) {
            Write-Host "Deployment successful!. Running tests..."
            
            # Test cases: (input_file, target_language)
            $test_cases = @(
                @("audios_test/example.wav", "cat"),
                @("audios_test/example.wav", "spa"),
                @("audios_test/example.wav", "eng")
            )

            $all_tests_passed = $true
            foreach ($test in $test_cases) {
                $input_file = $test[0]
                $target_lang = $test[1]
                
                Write-Host "`nTesting translation to $target_lang..."
                python test_seamless_server.py $input_file $target_lang
                
                if ($LASTEXITCODE -ne 0) {
                    Write-Error "Test failed for language $target_lang"
                    $all_tests_passed = $false
                    break
                }
            }

            if ($all_tests_passed) {
                Write-Host "`nAll tests passed successfully!"
            } else {
                Write-Error "`nSome tests failed. Please check the logs above."
                exit 1
            }
        } else {
            Write-Error "Deployment failed!"
            exit 1
        }
    } else {
        Write-Error "Push failed!"
        exit 1
    }
} else {
    Write-Error "Build failed!"
    exit 1
}

#gcloud artifacts repositories create cloud-run-source-deploy `
#--repository-format=docker `
#--location=europe-west1 `
#--description="Docker repository for Cloud Run deployments"

