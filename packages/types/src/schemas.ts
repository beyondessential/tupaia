export const IdForm = {
	"takesIdForm": {},
	"type": "string"
} 

export const MeditrakSurveyResponse = {
	"type": "object",
	"properties": {
		"id": {
			"takesIdForm": {},
			"type": "string"
		},
		"timestamp": {
			"type": "string"
		},
		"survey_id": {
			"takesIdForm": {},
			"type": "string"
		},
		"user_id": {
			"takesIdForm": {},
			"type": "string"
		},
		"clinic_id": {
			"takesIdForm": {},
			"type": "string"
		},
		"entity_id": {
			"takesIdForm": {},
			"type": "string"
		},
		"start_time": {
			"type": "string"
		},
		"end_time": {
			"type": "string"
		},
		"data_time": {
			"type": "string"
		},
		"approval_status": {
			"type": "string"
		}
	},
	"required": [
		"id",
		"survey_id",
		"timestamp",
		"user_id"
	]
} 

