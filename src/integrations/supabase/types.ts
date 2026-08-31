export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          maximum_discount: number | null
          minimum_order_amount: number
          starts_at: string | null
          store_id: string
          updated_at: string
          usage_count: number
          usage_limit: number | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          maximum_discount?: number | null
          minimum_order_amount?: number
          starts_at?: string | null
          store_id: string
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          maximum_discount?: number | null
          minimum_order_amount?: number
          starts_at?: string | null
          store_id?: string
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string
          store_id: string
          total_orders: number
          total_spent: number
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone: string
          store_id: string
          total_orders?: number
          total_spent?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          store_id?: string
          total_orders?: number
          total_spent?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_deliveries: {
        Row: {
          created_at: string
          delivered_at: string | null
          download_count: number
          download_token: string
          download_url: string | null
          expires_at: string | null
          id: string
          max_downloads: number | null
          order_id: string
          order_item_id: string | null
          product_id: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          download_count?: number
          download_token?: string
          download_url?: string | null
          expires_at?: string | null
          id?: string
          max_downloads?: number | null
          order_id: string
          order_item_id?: string | null
          product_id?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          download_count?: number
          download_token?: string
          download_url?: string | null
          expires_at?: string | null
          id?: string
          max_downloads?: number | null
          order_id?: string
          order_item_id?: string | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_deliveries_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_deliveries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_settings: {
        Row: {
          created_at: string
          facebook_pixel_id: string | null
          google_analytics_id: string | null
          id: string
          meta_conversion_api_enabled: boolean
          store_id: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          facebook_pixel_id?: string | null
          google_analytics_id?: string | null
          id?: string
          meta_conversion_api_enabled?: boolean
          store_id: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          facebook_pixel_id?: string | null
          google_analytics_id?: string | null
          id?: string
          meta_conversion_api_enabled?: boolean
          store_id?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean
          related_order_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          related_order_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          related_order_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          total: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_price: number
          quantity?: number
          total: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string
          currency: string
          customer_address: string | null
          customer_city: string | null
          customer_country: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          customer_whatsapp: string | null
          delivered_at: string | null
          discount_amount: number
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          payment_status: string
          product_id: string | null
          product_image: string | null
          product_name: string
          product_price: number
          quantity: number
          shipped_at: string | null
          shipping: number
          shop_id: string
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_country?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          customer_whatsapp?: string | null
          delivered_at?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          payment_status?: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          product_price: number
          quantity?: number
          shipped_at?: string | null
          shipping?: number
          shop_id: string
          status?: string
          subtotal: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_country?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          customer_whatsapp?: string | null
          delivered_at?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          payment_status?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          shipped_at?: string | null
          shipping?: number
          shop_id?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_id: string | null
          id: string
          order_id: string | null
          paid_at: string | null
          payment_method: string
          provider: string | null
          provider_transaction_id: string | null
          status: string
          store_id: string
          transaction_reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string
          store_id: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string
          store_id?: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          currency: string
          destination_account: string | null
          id: string
          owner_id: string
          payout_method: string
          processed_at: string | null
          status: string
          store_id: string
          transaction_reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          destination_account?: string | null
          id?: string
          owner_id: string
          payout_method?: string
          processed_at?: string | null
          status?: string
          store_id: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          destination_account?: string | null
          id?: string
          owner_id?: string
          payout_method?: string
          processed_at?: string | null
          status?: string
          store_id?: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          created_at: string
          product_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          product_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          position: number
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          position?: number
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          access_password: string | null
          category: string | null
          category_id: string | null
          compare_price: number | null
          cost_price: number | null
          cover_url: string | null
          created_at: string
          currency: string
          description: string | null
          digital_delivery_enabled: boolean
          download_limit: number | null
          expiration_days: number | null
          featured: boolean
          file_name: string | null
          file_size: number | null
          file_url: string | null
          gallery: Json
          id: string
          image_url: string | null
          license_key_enabled: boolean
          name: string
          password_protected: boolean
          price: number
          sales_count: number
          shop_id: string
          short_description: string | null
          sku: string | null
          slug: string | null
          status: string
          stock: number
          tags: Json
          type: string
          updated_at: string
          user_id: string
          views_count: number
          weight: number | null
        }
        Insert: {
          access_password?: string | null
          category?: string | null
          category_id?: string | null
          compare_price?: number | null
          cost_price?: number | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          digital_delivery_enabled?: boolean
          download_limit?: number | null
          expiration_days?: number | null
          featured?: boolean
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          gallery?: Json
          id?: string
          image_url?: string | null
          license_key_enabled?: boolean
          name: string
          password_protected?: boolean
          price?: number
          sales_count?: number
          shop_id: string
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          status?: string
          stock?: number
          tags?: Json
          type?: string
          updated_at?: string
          user_id: string
          views_count?: number
          weight?: number | null
        }
        Update: {
          access_password?: string | null
          category?: string | null
          category_id?: string | null
          compare_price?: number | null
          cost_price?: number | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          digital_delivery_enabled?: boolean
          download_limit?: number | null
          expiration_days?: number | null
          featured?: boolean
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          gallery?: Json
          id?: string
          image_url?: string | null
          license_key_enabled?: boolean
          name?: string
          password_protected?: boolean
          price?: number
          sales_count?: number
          shop_id?: string
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          status?: string
          stock?: number
          tags?: Json
          type?: string
          updated_at?: string
          user_id?: string
          views_count?: number
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          address: string | null
          banner_url: string | null
          color: string
          country: string | null
          created_at: string
          currency: string
          description: string | null
          email: string | null
          facebook_pixel_enabled: boolean
          facebook_pixel_id: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          secondary_color: string
          slug: string
          store_status: string
          store_type: string
          updated_at: string
          user_id: string
          whatsapp_enabled: boolean
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          color?: string
          country?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          email?: string | null
          facebook_pixel_enabled?: boolean
          facebook_pixel_id?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          secondary_color?: string
          slug: string
          store_status?: string
          store_type?: string
          updated_at?: string
          user_id: string
          whatsapp_enabled?: boolean
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          color?: string
          country?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          email?: string | null
          facebook_pixel_enabled?: boolean
          facebook_pixel_id?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          secondary_color?: string
          slug?: string
          store_status?: string
          store_type?: string
          updated_at?: string
          user_id?: string
          whatsapp_enabled?: boolean
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          allow_cod: boolean
          allow_online_payment: boolean
          checkout_message: string | null
          created_at: string
          facebook_pixel_id: string | null
          google_analytics_id: string | null
          id: string
          order_confirmation_message: string | null
          shipping_enabled: boolean
          store_id: string
          tax_enabled: boolean
          tax_rate: number
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          allow_cod?: boolean
          allow_online_payment?: boolean
          checkout_message?: string | null
          created_at?: string
          facebook_pixel_id?: string | null
          google_analytics_id?: string | null
          id?: string
          order_confirmation_message?: string | null
          shipping_enabled?: boolean
          store_id: string
          tax_enabled?: boolean
          tax_rate?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          allow_cod?: boolean
          allow_online_payment?: boolean
          checkout_message?: string | null
          created_at?: string
          facebook_pixel_id?: string | null
          google_analytics_id?: string | null
          id?: string
          order_confirmation_message?: string | null
          shipping_enabled?: boolean
          store_id?: string
          tax_enabled?: boolean
          tax_rate?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      store_visits: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          referrer: string | null
          session_id: string | null
          store_id: string
          visitor_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          referrer?: string | null
          session_id?: string | null
          store_id: string
          visitor_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          referrer?: string | null
          session_id?: string | null
          store_id?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_visits_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          payment_method: string | null
          provider: string | null
          status: string
          subscription_id: string | null
          transaction_reference: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          provider?: string | null
          status?: string
          subscription_id?: string | null
          transaction_reference?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          provider?: string | null
          status?: string
          subscription_id?: string | null
          transaction_reference?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          analytics_enabled: boolean
          cod_enabled: boolean
          created_at: string
          custom_domain_enabled: boolean
          description: string | null
          digital_products_enabled: boolean
          id: string
          max_orders: number | null
          max_products: number | null
          max_stores: number
          monthly_price: number
          name: string
          online_payments_enabled: boolean
          priority_support: boolean
          slug: string
          updated_at: string
          yearly_price: number
        }
        Insert: {
          analytics_enabled?: boolean
          cod_enabled?: boolean
          created_at?: string
          custom_domain_enabled?: boolean
          description?: string | null
          digital_products_enabled?: boolean
          id?: string
          max_orders?: number | null
          max_products?: number | null
          max_stores?: number
          monthly_price?: number
          name: string
          online_payments_enabled?: boolean
          priority_support?: boolean
          slug: string
          updated_at?: string
          yearly_price?: number
        }
        Update: {
          analytics_enabled?: boolean
          cod_enabled?: boolean
          created_at?: string
          custom_domain_enabled?: boolean
          description?: string | null
          digital_products_enabled?: boolean
          id?: string
          max_orders?: number | null
          max_products?: number | null
          max_stores?: number
          monthly_price?: number
          name?: string
          online_payments_enabled?: boolean
          priority_support?: boolean
          slug?: string
          updated_at?: string
          yearly_price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          cancelled_at: string | null
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string
          id: string
          plan_id: string | null
          price: number
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          plan_id?: string | null
          price?: number
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          plan_id?: string | null
          price?: number
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string | null
          created_at: string
          id: string
          message: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          message: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_shop: { Args: { _shop_id: string }; Returns: boolean }
      shop_exists: { Args: { _shop_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "seller" | "admin" | "support"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["seller", "admin", "support"],
    },
  },
} as const
