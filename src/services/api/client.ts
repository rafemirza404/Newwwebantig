/**
 * API Client
 * Base HTTP client for making API requests
 */

import type { ApiResponse } from '@/types/api';

export class ApiClient {
  /**
   * Make a generic HTTP request
   */
  private async request<T>(
    url: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle empty responses
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      return { data, status: response.status };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  }

  /**
   * POST request
   */
  async post<T, R>(url: string, body: T): Promise<ApiResponse<R>> {
    return this.request<R>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * GET request
   */
  async get<R>(url: string): Promise<ApiResponse<R>> {
    return this.request<R>(url, {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient();
