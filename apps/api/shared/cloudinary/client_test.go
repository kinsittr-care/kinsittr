package cloudinary

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req)
}

func TestUploadImageBuildsSignedRequest(t *testing.T) {
	client := NewClient("demo-cloud", "api-key", "secret")
	client.http = &http.Client{
		Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			if req.Method != http.MethodPost {
				t.Fatalf("expected POST, got %s", req.Method)
			}
			if req.URL.String() != "https://api.cloudinary.com/v1_1/demo-cloud/image/upload" {
				t.Fatalf("unexpected upload URL: %s", req.URL.String())
			}
			if err := req.ParseMultipartForm(1024 * 1024); err != nil {
				t.Fatal(err)
			}

			required := []string{"folder", "invalidate", "overwrite", "public_id", "timestamp", "api_key", "signature"}
			for _, field := range required {
				if len(req.MultipartForm.Value[field]) == 0 || req.MultipartForm.Value[field][0] == "" {
					t.Fatalf("expected multipart field %s", field)
				}
			}
			if got := req.MultipartForm.Value["folder"][0]; got != "nanny-avatars" {
				t.Fatalf("expected folder nanny-avatars, got %s", got)
			}
			if got := req.MultipartForm.Value["public_id"][0]; got != "profile-id" {
				t.Fatalf("expected public_id profile-id, got %s", got)
			}
			if got := req.MultipartForm.Value["overwrite"][0]; got != "true" {
				t.Fatalf("expected overwrite true, got %s", got)
			}
			if got := req.MultipartForm.Value["invalidate"][0]; got != "true" {
				t.Fatalf("expected invalidate true, got %s", got)
			}

			payload, _ := json.Marshal(UploadResult{
				SecureURL: "https://res.cloudinary.com/demo/image/upload/profile-id.png",
				PublicID:  "nanny-avatars/profile-id",
			})
			return &http.Response{
				StatusCode: http.StatusOK,
				Header:     make(http.Header),
				Body:       io.NopCloser(strings.NewReader(string(payload))),
			}, nil
		}),
	}

	result, err := client.UploadImage(context.Background(), []byte("image-bytes"), "nanny-avatars", "profile-id")
	if err != nil {
		t.Fatal(err)
	}
	if result.PublicID != "nanny-avatars/profile-id" {
		t.Fatalf("unexpected public id: %s", result.PublicID)
	}
}
