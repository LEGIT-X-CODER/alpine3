/**
 * config.js — Single source of truth for all API endpoints.
 *
 * For Q2 (single VM): all requests go to same server via Nginx proxy.
 * For Q3/Q4 (two VMs): Nginx on VM1 transparently proxies /api/students to VM2.
 * The frontend code never needs to change between Q2, Q3, and Q4.
 */
const API_HOST = 'http://localhost:8080/alpine-webtech';

const API = {
  STRING:   API_HOST + '/api/string',
  MATH:     API_HOST + '/api/math',
  STUDENTS: API_HOST + '/api/students',
};

// App metadata
const APP = {
  name:    'Alpine WebTech',
  version: '1.0.0',
  college: 'HBTU Kanpur',
  course:  'Web Technology — 2nd B.Tech CSE',
};
