"use client";

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../../hooks/useAuth";
import { api, type Contact } from "../../../../lib/api";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadContacts();
    }
  }, [isAuthenticated, user]);

  const loadContacts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getContacts("default-workspace");
      setContacts(response.contacts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contacts");
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    
    try {
      await api.deleteContact(contactId);
      await loadContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete contact");
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-yellow-500"];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!isAuthenticated || !user) {
    return <div>Please sign in to view contacts.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">Manage your customer contacts and track their information.</p>
        </div>
        <Link
          href="/dashboard/crm/contacts/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Contact
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
          <button
            onClick={loadContacts}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {isLoading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center text-gray-500">Loading contacts...</div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Contacts ({contacts.length})</h2>
          </div>
          
          {contacts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-4">No contacts found</div>
              <Link
                href="/dashboard/crm/contacts/new"
                className="inline-block text-blue-600 hover:text-blue-700"
              >
                Create your first contact →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {contacts.map((contact) => (
                <div key={contact.id.value} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`${getAvatarColor(contact.firstName)} w-12 h-12 rounded-full flex items-center justify-center text-white font-medium`}>
                        {getInitials(contact.firstName, contact.lastName)}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </h3>
                        {contact.email && (
                          <a href={`mailto:${contact.email.value}`} className="text-blue-600 hover:text-blue-800">
                            {contact.email.value}
                          </a>
                        )}
                        {contact.phone && (
                          <div className="text-gray-600">{contact.phone.value}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/crm/contacts/${contact.id.value}`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(contact.id.value)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
