import SafeScreen from "@/components/SafeScreen";
import { useAddresses } from "@/hooks/useAddressess";
import useCart from "@/hooks/useCart";
import { useApi } from "@/lib/api";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import OrderSummary from "@/components/OrderSummary";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import * as Sentry from "@sentry/react-native";

const CartScreen = () => {

  const api = useApi();

  const {
    cart,
    cartItemCount,
    cartTotal,
    clearCart,
    isError,
    isLoading,
    isRemoving,
    isUpdating,
    removeFromCart,
    updateQuantity,
  } = useCart();

  const { addresses } = useAddresses();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const cartItems = cart?.items || [];

  const subtotal = cartTotal;
  const shipping = 10.0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (
    productId: string,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    updateQuantity({ productId, quantity: newQuantity });
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert("Remove Item", `Remove ${productName} from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromCart(productId),
      },
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (!addresses || addresses.length === 0) {
      Alert.alert(
        "No Address",
        "Please add a shipping address in your profile before checking out."
      );
      return;
    }

    setAddressModalVisible(true);
  };

  const handleProceedWithPayment = async (selectedAddress: Address) => {
  setAddressModalVisible(false);

  try {
    setPaymentLoading(true);

    // ✅ FORMAT CART ITEMS FOR BACKEND
    const formattedCartItems = cartItems
      .filter(item => item.product?._id)
      .map(item => ({
        product: item.product._id, // IMPORTANT
        quantity: item.quantity,
      }));

    if (formattedCartItems.length === 0) {
      Alert.alert("Error", "Your cart is invalid. Please re-add items.");
      return;
    }

    const { data } = await api.post("/payment/create-intent", {
      cartItems: formattedCartItems,
      shippingAddress: {
        fullName: selectedAddress.fullName,
        streetAddress: selectedAddress.streetAddress,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode,
        phoneNumber: selectedAddress.phoneNumber,
      },
    });

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: data.clientSecret,
      merchantDisplayName: "Your Store Name",
    });

    if (initError) {
      Alert.alert("Error", initError.message);
      return;
    }

    const { error: presentError } = await presentPaymentSheet();

    if (presentError) {
      Alert.alert("Payment cancelled", presentError.message);
    } else {
      Alert.alert("Success", "Payment successful!");
      clearCart();
    }
  } catch (error: any) {
    console.log("Payment error:", error?.response?.data || error);
    Alert.alert(
      "Error",
      error?.response?.data?.error || "Payment failed"
    );
  } finally {
    setPaymentLoading(false);
  }
};

  if (isLoading) return <LoadingUI />;
  if (isError) return <ErrorUI />;
  if (cartItems.length === 0) return <EmptyUI />;

  return (
    <SafeScreen>
      <Text className="px-6 pb-5 text-text-primary text-3xl font-bold tracking-tight">
        Cart
      </Text>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 240 }}
      >
        <View className="px-6 gap-2">
          {cartItems.map((item) => {
            const product = item.product;
            if (!product) return null; 

            return (
              <View
                key={item._id}
                className="bg-surface rounded-3xl overflow-hidden"
              >
                <View className="p-4 flex-row">
                  <View className="relative">
                    <Image
                      source={
                        product.images?.[0] ??
                        "https://via.placeholder.com/150"
                      }
                      contentFit="cover"
                      className="bg-background-lighter"
                      style={{ width: 112, height: 112, borderRadius: 16 }}
                    />

                    <View className="absolute top-2 right-2 bg-primary rounded-full px-2 py-0.5">
                      <Text className="text-background text-xs font-bold">
                        ×{item.quantity}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-1 ml-4 justify-between">
                    <View>
                      <Text
                        className="text-text-primary font-bold text-lg leading-tight"
                        numberOfLines={2}
                      >
                        {product.name}
                      </Text>

                      <View className="flex-row items-center mt-2">
                        <Text className="text-primary font-bold text-2xl">
                          ${(product.price * item.quantity).toFixed(2)}
                        </Text>
                        <Text className="text-text-secondary text-sm ml-2">
                          ${product.price.toFixed(2)} each
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center mt-3">
                      <TouchableOpacity
                        className="bg-background-lighter rounded-full w-9 h-9 items-center justify-center"
                        onPress={() =>
                          handleQuantityChange(
                            product._id,
                            item.quantity,
                            -1
                          )
                        }
                        disabled={isUpdating}
                      >
                        <Ionicons name="remove" size={18} color="#FFFFFF" />
                      </TouchableOpacity>

                      <View className="mx-4 min-w-[32px] items-center">
                        <Text className="text-text-primary font-bold text-lg">
                          {item.quantity}
                        </Text>
                      </View>

                      <TouchableOpacity
                        className="bg-primary rounded-full w-9 h-9 items-center justify-center"
                        onPress={() =>
                          handleQuantityChange(
                            product._id,
                            item.quantity,
                            1
                          )
                        }
                        disabled={isUpdating}
                      >
                        <Ionicons name="add" size={18} color="#121212" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="ml-auto bg-red-500/10 rounded-full w-9 h-9 items-center justify-center"
                        onPress={() =>
                          handleRemoveItem(product._id, product.name)
                        }
                        disabled={isRemoving}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <OrderSummary
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
        />
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-background/95 border-t border-surface pt-4 pb-32 px-6">
        <View className="flex-row justify-between mb-4">
          <Text className="text-text-secondary">
            {cartItemCount} items
          </Text>
          <Text className="text-text-primary font-bold text-xl">
            ${total.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-primary rounded-2xl"
          onPress={handleCheckout}
          disabled={paymentLoading}
        >
          <View className="py-5 flex-row justify-center">
            <Text className="text-background font-bold text-lg">
              Checkout
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <AddressSelectionModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onProceed={handleProceedWithPayment}
        isProcessing={paymentLoading}
      />
    </SafeScreen>
  );
};

export default CartScreen;


function LoadingUI() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#00D9FF" />
      <Text className="text-text-secondary mt-4">Loading cart...</Text>
    </View>
  );
}

function ErrorUI() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
      <Text className="text-text-primary font-semibold text-xl mt-4">
        Failed to load cart
      </Text>
    </View>
  );
}

function EmptyUI() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Ionicons name="cart-outline" size={80} color="#666" />
      <Text className="text-text-primary font-semibold text-xl mt-4">
        Your cart is empty
      </Text>
    </View>
  );
}
