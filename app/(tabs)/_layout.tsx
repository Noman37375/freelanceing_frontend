// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router'
import { View, StyleSheet, Platform } from 'react-native'
import {
  Home,
  Search,
  MessageCircle,
  User,
  PanelsTopLeft,
} from 'lucide-react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',

        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },

        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },

        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,

          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
            },
            android: {
              elevation: 18,
            },
            web: {
              boxShadow: '0px -4px 12px rgba(0,0,0,0.06)',
            },
          }),
        },
      }}
    >
      {/** Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <IconWrapper focused={focused}>
              <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </IconWrapper>
          ),
        }}
      />

      {/** Messages */}
      <Tabs.Screen
        name="messages"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <IconWrapper focused={focused}>
              <MessageCircle size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </IconWrapper>
          ),
        }}
      />

      {/** Projects */}
      <Tabs.Screen
        name="projects"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <IconWrapper focused={focused}>
              <Search size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </IconWrapper>
          ),
        }}
      />

      {/** My Work */}
      <Tabs.Screen
        name="my-work"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <IconWrapper focused={focused}>
              <PanelsTopLeft size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </IconWrapper>
          ),
        }}
      />

      {/** Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <IconWrapper focused={focused}>
              <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </IconWrapper>
          ),
        }}
      />
    </Tabs>
  )
}

/** Reusable icon wrapper */
function IconWrapper({
  children,
  focused,
}: {
  children: React.ReactNode
  focused: boolean
}) {
  return (
    <View
      style={[
        styles.iconContainer
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 32,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

})