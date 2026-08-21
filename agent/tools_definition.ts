/**
 * Google GenAI / Vertex AI Tool Declarations & Execution Wrapper
 * for Cymbal Auto UCP & Agent Architecture.
 */

import { FunctionDeclaration, Type } from '@google/genai';
import { ICommerceProvider, IInventoryProvider, IPurchaseIntentRepository } from '@/lib/services/interfaces';

/**
 * Type-safe Function Declarations for Google GenAI / Vertex AI Agent SDK
 */
export const cymbalAgentToolDeclarations: FunctionDeclaration[] = [
  {
    name: 'getStockLevels',
    description: 'Retrieves current stock count and availability status for a tyre product across depots.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        productId: {
          type: Type.STRING,
          description: 'The unique product identifier (e.g. "michelin-ps5-225-45r17")',
        },
        storeId: {
          type: Type.STRING,
          description: 'Optional store ID ("birmingham", "bristol", or "croydon")',
        },
      },
      required: ['productId'],
    },
  },
  {
    name: 'replenishStock',
    description: 'Replenishes stock count for a tyre at a specific depot and triggers inventory events.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        productId: {
          type: Type.STRING,
          description: 'Product identifier',
        },
        storeId: {
          type: Type.STRING,
          description: 'Depot store identifier',
        },
        quantity: {
          type: Type.INTEGER,
          description: 'Quantity of tyres arriving',
        },
      },
      required: ['productId', 'storeId', 'quantity'],
    },
  },
  {
    name: 'getPendingPurchaseIntents',
    description: 'Fetches authorized AP2 conditional purchase intents awaiting back-in-stock fulfillment.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        productId: {
          type: Type.STRING,
          description: 'Optional product filter',
        },
        storeId: {
          type: Type.STRING,
          description: 'Optional store filter',
        },
      },
    },
  },
  {
    name: 'fulfillPurchaseIntent',
    description: 'Executes order placement against an authorized AP2 conditional intent.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        intentId: {
          type: Type.STRING,
          description: 'The unique ID of the purchase intent record',
        },
        fulfillmentNote: {
          type: Type.STRING,
          description: 'Reason or context for autonomous fulfillment',
        },
      },
      required: ['intentId'],
    },
  },
  {
    name: 'applyCheckoutRecovery',
    description: 'Applies a recovery discount offer and personalized guidance message to a stalled checkout session.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        checkoutId: {
          type: Type.STRING,
          description: 'The stalled checkout session ID',
        },
        discountPercent: {
          type: Type.NUMBER,
          description: 'Discount percentage (1-15%)',
        },
        recoveryMessage: {
          type: Type.STRING,
          description: 'Customer message explaining the recovery incentive',
        },
      },
      required: ['checkoutId', 'discountPercent', 'recoveryMessage'],
    },
  },
  {
    name: 'evaluateTyreSuitabilityGrounded',
    description: 'Evaluates customer vehicle fitment and driving conditions against live web test sources with strict 100% grounding. If ambiguous, triggers human technician referral.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Driver question or vehicle requirement',
        },
        vehicleRegOrModel: {
          type: Type.STRING,
          description: 'Optional vehicle model or VRN',
        },
        selectedStoreId: {
          type: Type.STRING,
          description: 'Local fitting autocentre ID',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'escalateToHumanTechnician',
    description: 'Creates a priority human-in-the-loop escalation ticket for a Master Technician when confidence is under 100% or staggered fitment requires verification.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: {
          type: Type.STRING,
          description: 'Reason for technician deferral',
        },
        customerName: {
          type: Type.STRING,
          description: 'Customer name',
        },
        customerPhone: {
          type: Type.STRING,
          description: 'Customer telephone',
        },
        preferredDepot: {
          type: Type.STRING,
          description: 'Depot store ID',
        },
      },
      required: ['reason', 'preferredDepot'],
    },
  },
];

/**
 * Agent Tool Dispatcher: executes tool calls directly against the service provider.
 */
export class CymbalAgentToolDispatcher {
  constructor(
    private commerceService: ICommerceProvider,
    private inventoryProvider: IInventoryProvider,
    private intentRepo: IPurchaseIntentRepository
  ) {}

  async executeTool(name: string, args: Record<string, any>): Promise<any> {
    switch (name) {
      case 'getStockLevels': {
        const { productId, storeId } = args;
        if (storeId) {
          return await this.inventoryProvider.getStock(productId, storeId);
        }
        const product = await this.commerceService.getProductById(productId);
        return product ? product.stockByStore : { error: 'Product not found' };
      }

      case 'replenishStock': {
        const { productId, storeId, quantity } = args;
        return await this.inventoryProvider.replenishStock(productId, storeId, Number(quantity));
      }

      case 'getPendingPurchaseIntents': {
        const { productId, storeId } = args;
        return await this.intentRepo.getIntents({
          productId,
          storeId,
          status: 'PENDING_STOCK',
        });
      }

      case 'fulfillPurchaseIntent': {
        const { intentId, fulfillmentNote } = args;
        return await this.intentRepo.updateIntentStatus(
          intentId,
          'fulfilled',
          fulfillmentNote || 'Fulfilled by Google ADK Agent'
        );
      }

      case 'applyCheckoutRecovery': {
        const { checkoutId, discountPercent, recoveryMessage } = args;
        return await this.commerceService.markCheckoutRecovered(
          checkoutId,
          discountPercent,
          recoveryMessage
        );
      }

      case 'evaluateTyreSuitabilityGrounded': {
        const { query, selectedStoreId } = args;
        const res = await fetch('/api/assistant/consult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, selectedStoreId, requireStrictGrounding: true }),
        });
        return await res.json();
      }

      case 'escalateToHumanTechnician': {
        const res = await fetch('/api/assistant/escalate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
        });
        return await res.json();
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
