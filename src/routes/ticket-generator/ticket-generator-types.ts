export type TicketData = {
	id: string
	title: string
	description: string
	acceptance_criteria: string[]
	steps_to_reproduce: string[]
	technical_notes: string[]
	priority: 'low' | 'medium' | 'high'
	labels: string[]
	assignee: string
	status: 'draft' | 'open' | 'in_progress' | 'in_review' | 'rejected' | 'closed'
}
