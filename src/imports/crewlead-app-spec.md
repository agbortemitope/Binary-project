APP ROLE

User Role: CrewLead

CrewLead can:

Create teams

Fund wallet

Create tasks

Approve submissions

Configure payout rules

Invite members

Chat

View analytics

Manage team settings

GLOBAL NAVIGATION STRUCTURE

Bottom Tabs:

Dashboard

Teams

Tasks

Chat

Wallet

Profile

SCREENS TO BUILD

CrewLead Onboarding Flow

Screen 1: Welcome

CTA: Create Team

CTA: Join Existing Team

Screen 2: Create Team
Fields:

Team Name

Team Type (Formal / Informal)

Currency

Payout Mode (Instant / Scheduled)

If Scheduled → Show frequency selector

Minimum payout threshold
Button: Create Team

On submit:

Create team record

Create default group chat

Redirect to Fund Wallet screen

Dashboard Screen

Top Cards:

Wallet Balance

Reserved Balance

Active Members

Active Tasks

Next Payout Date

Sections:

Pending Approvals

Recent Activity Feed

Quick Actions:

Create Task

Fund Wallet

Invite Members

Teams Screen

List of Teams

Each Card:

Team Name

Member Count

Wallet Balance

Active Tasks

Button: Manage

Manage Team Screen:
Tabs:

Overview

Members

Payout Settings

Settings

Overview:

Wallet summary

Task stats

Activity preview

Members:

List members

Role badge

Remove button

Promote to Manager

Invite button

Payout Settings:

Toggle Instant / Scheduled

If Scheduled → Frequency selector

Threshold input

Save Changes

Settings:

Edit Team Name

Delete Team

Leave Team

Task Management Flow

Tasks Screen:
Tabs:

Active

Pending Review

Completed

Task Card:

Title

Assigned Member

Reward

Status

Deadline

Create Task Screen:
Fields:

Title

Description

Reward Amount

Assign Member

Deadline

Attach Files
Button: Publish Task

On publish:

Deduct reward from wallet to reserved_balance

Notify assigned member

Task Detail Screen:
Sections:

Task Info

Submissions

Task Chat

If submission pending:

Approve button

Reject button

On approve:

Release funds to CrewMate pending balance

Reduce reserved balance

Notify CrewMate

Wallet Screen

Sections:

Total Balance

Reserved Balance

Available Balance

Pending Payouts

Buttons:

Fund Wallet

Withdraw Funds

View Transactions

Transactions List:

Funding

Task Reserved

Task Approved

Payout Sent

Chat System

Tabs:

Team Chat

Direct Messages

Task Chats

Conversation Screen:

Scrollable messages

Sender name

Timestamp

Attachment preview

Input bar

Send button

Chat Types:

Group (team)

Direct (1:1)

Task-linked

Use realtime subscriptions.

Notifications System

Trigger push notification when:

New submission

New message

Low wallet balance

Payout processed

Include in-app badge count.

Analytics Screen (Inside Team)

Metrics:

Total payouts

Avg task completion time

Active members

Top performer

Pending approvals

Use simple charts.

Profile Screen

Name

Email

Phone

Payment method

KYC status

Logout

DATABASE SCHEMA

Tables:

users

id

name

email

role

teams

id

name

type

payout_mode

payout_frequency

threshold

wallet_balance

reserved_balance

created_by

team_members

id

team_id

user_id

role

tasks

id

team_id

title

description

reward

assigned_to

deadline

status

submissions

id

task_id

user_id

file_url

status

transactions

id

team_id

type

amount

reference

chat_rooms

id

team_id

type

task_id

messages

id

chat_room_id

sender_id

content

created_at

BUSINESS LOGIC RULES

Cannot create task if wallet_balance < reward

Reserved funds lock immediately on task creation

On approval:

reserved_balance -= reward

create payout record

CrewMate cannot see wallet totals

Only Owner can edit payout rules

DELIVERABLES

Generate:

Full folder structure

All screens

Navigation config

Zustand store

Supabase queries

Realtime subscriptions

Validation rules

Dummy seed data

Clean UI layout

Do not return explanation.
Return complete implementation-ready code.

PROMPT ENDS