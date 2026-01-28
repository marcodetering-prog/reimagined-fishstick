import { NextRequest, NextResponse } from 'next/server';
import dataStore, { type Client } from '@/lib/data-store';

// GET all clients
export async function GET() {
  console.log('[API/Clients] GET request received');
  try {
    const clients = dataStore.getAllClients();
    console.log('[API/Clients] ✅ Fetched', clients.length, 'clients');

    return NextResponse.json({ clients });
  } catch (error) {
    console.error('[API/Clients] ❌ Error fetching clients:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new client
export async function POST(request: NextRequest) {
  console.log('[API/Clients] POST request received');
  try {
    const body = await request.json();
    const { name, description, color } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }

    const client = dataStore.addClient({
      name: name.trim(),
      description: description?.trim(),
      color: color || `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color if not provided
    });

    console.log('[API/Clients] ✅ Client created:', client.id);

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('[API/Clients] ❌ Error creating client:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH update client
export async function PATCH(request: NextRequest) {
  console.log('[API/Clients] PATCH request received');
  try {
    const body = await request.json();
    const { id, name, description, color } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const client = dataStore.getClient(id);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const updated = dataStore.updateClient(id, {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() }),
      ...(color && { color }),
    });

    console.log('[API/Clients] ✅ Client updated:', id);

    return NextResponse.json({ client: updated });
  } catch (error) {
    console.error('[API/Clients] ❌ Error updating client:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE client
export async function DELETE(request: NextRequest) {
  console.log('[API/Clients] DELETE request received');
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const client = dataStore.getClient(id);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    dataStore.deleteClient(id);
    console.log('[API/Clients] ✅ Client deleted:', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API/Clients] ❌ Error deleting client:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
