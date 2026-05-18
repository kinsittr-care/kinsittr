package dtos

type UpdateScreeningStepsDTO struct {
	DocsReviewed      *bool `json:"docs_reviewed"`
	ReferencesChecked *bool `json:"references_checked"`
	InterviewDone     *bool `json:"interview_done"`
}
