package cloudinary

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"
)

const apiBase = "https://api.cloudinary.com/v1_1"

type Client struct {
	cloudName string
	apiKey    string
	apiSecret string
	http      *http.Client
}

type UploadResult struct {
	SecureURL string `json:"secure_url"`
	PublicID  string `json:"public_id"`
}

func NewClient(cloudName, apiKey, apiSecret string) *Client {
	return &Client{
		cloudName: cloudName,
		apiKey:    apiKey,
		apiSecret: apiSecret,
		http:      &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *Client) Configured() bool {
	return strings.TrimSpace(c.cloudName) != "" &&
		strings.TrimSpace(c.apiKey) != "" &&
		strings.TrimSpace(c.apiSecret) != ""
}

func (c *Client) UploadImage(ctx context.Context, data []byte, folder, publicID string) (UploadResult, error) {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	params := map[string]string{
		"folder":     folder,
		"invalidate": "true",
		"overwrite":  "true",
		"public_id":  publicID,
		"timestamp":  timestamp,
	}
	signature := c.sign(params)

	var buf bytes.Buffer
	w := multipart.NewWriter(&buf)

	fw, err := w.CreateFormFile("file", "image")
	if err != nil {
		return UploadResult{}, err
	}
	if _, err := fw.Write(data); err != nil {
		return UploadResult{}, err
	}

	_ = w.WriteField("folder", folder)
	_ = w.WriteField("invalidate", "true")
	_ = w.WriteField("overwrite", "true")
	_ = w.WriteField("public_id", publicID)
	_ = w.WriteField("timestamp", timestamp)
	_ = w.WriteField("api_key", c.apiKey)
	_ = w.WriteField("signature", signature)
	w.Close()

	endpoint := fmt.Sprintf("%s/%s/image/upload", apiBase, c.cloudName)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, &buf)
	if err != nil {
		return UploadResult{}, err
	}
	req.Header.Set("Content-Type", w.FormDataContentType())

	resp, err := c.http.Do(req)
	if err != nil {
		return UploadResult{}, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return UploadResult{}, err
	}
	if resp.StatusCode >= 400 {
		return UploadResult{}, fmt.Errorf("cloudinary_error_%d: %s", resp.StatusCode, string(body))
	}

	var result UploadResult
	if err := json.Unmarshal(body, &result); err != nil {
		return UploadResult{}, err
	}
	return result, nil
}

func (c *Client) DeleteImage(ctx context.Context, publicID string) error {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	params := map[string]string{
		"public_id": publicID,
		"timestamp": timestamp,
	}
	signature := c.sign(params)

	values := url.Values{}
	values.Set("public_id", publicID)
	values.Set("timestamp", timestamp)
	values.Set("api_key", c.apiKey)
	values.Set("signature", signature)

	endpoint := fmt.Sprintf("%s/%s/image/destroy", apiBase, c.cloudName)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader(values.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("cloudinary_error_%d: %s", resp.StatusCode, string(body))
	}
	return nil
}

func (c *Client) sign(params map[string]string) string {
	keys := make([]string, 0, len(params))
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	parts := make([]string, 0, len(keys))
	for _, k := range keys {
		parts = append(parts, k+"="+params[k])
	}

	toSign := strings.Join(parts, "&") + c.apiSecret
	hash := sha256.Sum256([]byte(toSign))
	return hex.EncodeToString(hash[:])
}
